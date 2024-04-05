import { api } from './convex/_generated/api.js';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
import { ConvexHttpClient } from 'convex/browser';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Elysia, t } from 'elysia';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { swagger } from '@elysiajs/swagger';
import type { Id } from './convex/_generated/dataModel.js';
import { jwt } from '@elysiajs/jwt'
import { cors } from '@elysiajs/cors'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const chatModel = new ChatOpenAI();
const splitter = new RecursiveCharacterTextSplitter();

const app = new Elysia()
    .use(cors())
    .use(swagger({
        documentation: {
            info: {
                title: 'Elysia Documentation',
                version: '1.0.0'
            }
        }
    }))
jwt({
    name: 'jwt',
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    secret: process.env.JWT_SECRET!,
})



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
    });

}, {
    body: t.Object({
        message: t.String({ default: 'Hello World' })
    })
})

app.post('/file', async ({ body }) => {
    try {


        body.files.map(async (file: File) => {
            const loader = new PDFLoader(file, { parsedItemSeparator: "", splitPages: true });

            const docs = await loader.load();

            const newFiles = await client.mutation(api.files.createFile, { name: file.name, owner: body.owner as Id<"users"> });

            for (const doc of docs) {
                doc.metadata.source = file.name;
                doc.metadata.docId = newFiles;
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
    })
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
    })
})


app.listen(3000)

