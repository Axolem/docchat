import { api } from './convex/_generated/api.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { ConvexHttpClient } from 'convex/browser';
import { cors } from '@elysiajs/cors';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { logger } from '@bogeychan/elysia-logger';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { rateLimit } from 'elysia-rate-limit';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { swagger } from '@elysiajs/swagger';
import type { Id } from './convex/_generated/dataModel.js';
import { createHash } from "node:crypto";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
// biome-ignore lint/complexity/useLiteralKeys: <explanation>
const client = new ConvexHttpClient(process.env['CONVEX_URL']!);

const chatModel = new ChatOpenAI();
const splitter = new RecursiveCharacterTextSplitter();

const app = new Elysia()
    .use(cors())
    .use(rateLimit({
        max: 10,
        duration: 60_000,
    }))
    .use(swagger({
        documentation: {
            info: {
                title: 'Elysia Documentation',
                version: '1.0.0'
            }
        }
    }))
    .use(jwt({
        name: "jwt",
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        secret: process.env['JWT_SECRET']!,
        exp: "1d",
    })).use(logger({
        level: "info", browser: { asObject: false }, timestamp: true
    }))
    .state({ uid: "" })


app.post("signup", async ({ body }) => {

    const securePassword = createHash('sha256').update(body.password).digest('hex');

    try {
        await client.mutation(api.files.createUser, {
            email: body.email,
            password: securePassword,
            role: "user"
        });

        return new Response(JSON.stringify({ message: "Created successfully" }), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })

    } catch (error) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ message: error.message.split("\n")[1].split(":")[1] }), { status: 409, statusText: 'Duplicate', headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } })
    }
}, {
    body: t.Object({
        email: t.String({ format: "email", title: "Email" }),
        password: t.String({ minLength: 8, title: "Password", description: "Password must be at least 8 characters" })
    }),
    type: "application/json"
})

app.post("signin", async ({ body, jwt }) => {
    const securePassword = createHash('sha256').update(body.password).digest('hex');

    try {
        const user = await client.query(api.files.getUserByEmail, { email: body.email });

        if (!user) {
            return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }

        if (user.password !== securePassword) {
            return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }

        // Remove password from user object
        const { password, ...emptyUser } = user;

        const token = await jwt.sign(emptyUser)

        return new Response(JSON.stringify({ token, user: emptyUser }), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })

    } catch (error) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ message: error.message.split("\n")[1].split(":")[1] }), { status: 404, statusText: 'Not Found', headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } })
    }
},
    {
        body: t.Object({
            email: t.String({ format: "email", title: "Email" }),
            password: t.String({ minLength: 8, title: "Password" })
        })
    }
)

app.get("validate/:token", async ({ params, jwt }) => {
    try {
        const user = await jwt.verify(params.token);
        if (!user) {
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ user }), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })

    } catch (error) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({ message: error.message }), { status: 404, statusText: 'Not Found', headers: { 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } })
    }
},
    {
        params: t.Object({
            token: t.String()
        })
    }
)

app.onBeforeHandle((request) => {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    if (request.request.headers.get("origin") !== process.env["ORIGIN"] && request.request.headers.get("referer") !== process.env["REFERER"]) {
        return JSON.stringify({ message: "Not allowed", status: 403, statusText: 'Forbidden' })
    }
})

app.get("/", async ({ store }) => {
    const files = await client.query(api.files.getUserFiles, { userId: store.uid as Id<"users"> });
    return new Response(JSON.stringify(files), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })
},
    {
        beforeHandle: async ({ jwt, request, store }) => {
            const user = await jwt.verify(request.headers.get("token") ?? undefined) as { _id: string };
            if (!user) {
                return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
            }

            store.uid = user._id;
        }
    }
)

app.post('/', async ({ body }) => {

    const matches = await client.action(api.myActions.search, { query: body.message })

    const prompt =
        ChatPromptTemplate.fromTemplate("Answer the following question based only on the provided context:  <context>  {context}  </context>  Question: {input} Answer: <format> markdown <format>",);

    const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt,
    });

    const metadata = JSON.parse(matches.resultOne);

    return await documentChain.invoke({
        input: body.message,
        context: metadata,
    }, {
        metadata: metadata[0]?.metadata,
    })

}, {
    body: t.Object({
        message: t.String({ default: 'Hello World' })
    }),
    beforeHandle: async ({ jwt, request, store }) => {
        const user = await jwt.verify(request.headers.get("token") ?? undefined) as { _id: string };
        if (!user) {
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }

        store.uid = user._id;
    }
})

app.post('/file', async ({ body }) => {
    try {

        body.files.map(async (file: File) => {
            const loader = new PDFLoader(file, { parsedItemSeparator: "", splitPages: true });

            const docs = await loader.load();

            const newFiles = await client.mutation(api.files.createFile, { name: file.name, owner: body.owner as Id<"users"> });

            for (const doc of docs) {
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                doc.metadata['source'] = file.name;
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                doc.metadata['docId'] = newFiles;
            }

            const splitDocs = await splitter.splitDocuments(docs);

            const response = await client.action(api.myActions.ingest, {
                texts: splitDocs.map((doc) => doc.pageContent),
                metadata: splitDocs.map((doc) => JSON.stringify(doc.metadata))
            })

            return new Response(JSON.stringify(response), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })

        })
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, statusText: 'Internal Server Error', headers: { 'Content-Type': 'application/json' } })
    }

}, {
    body: t.Object({
        files: t.Files({ type: "application/pdf", readOnly: true }),
        owner: t.String({ default: "j97cjrjqz99n61h7jm05qz9wsh6pnptq" })
    }),
    beforeHandle: async ({ jwt, request }) => {
        const user = await jwt.verify(request.headers.get("token") ?? undefined);
        if (!user) {
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }
    }
})

app.delete("/file/:id", async ({ params }) => {
    const file = await client.mutation(api.files.deleteFile, { id: params.id as Id<"files"> });
    return new Response(JSON.stringify(file), { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/json' } })
}, {
    params: t.Object({
        id: t.String({
            minLength: 30,
            maxLength: 50
        })
    }),
    headers: t.Object({
        token: t.String()
    }),
    beforeHandle: async ({ jwt, request }) => {
        const user = await jwt.verify(request.headers.get("token") ?? undefined);
        if (!user) {
            return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } })
        }
    }
})

// biome-ignore lint/complexity/useLiteralKeys: <explanation>
app.listen(process.env['PORT'] || 3000, (e) => {
    console.log('Server running on port', e.port)
})

