import { api } from "./convex/_generated/api.js";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { ConvexHttpClient } from "convex/browser";
import { cors } from "@elysiajs/cors";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { logger } from "@bogeychan/elysia-logger";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PromptTemplate } from "@langchain/core/prompts";
import { rateLimit } from "elysia-rate-limit";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RunnableSequence } from "langchain/runnables";
import { swagger } from "@elysiajs/swagger";
import type { Id } from "./convex/_generated/dataModel.js";
import { createHash } from "node:crypto";

// biome-ignore lint/style/noNonNullAssertion: Null assertion is used to avoid unnecessary checks
// biome-ignore lint/complexity/useLiteralKeys:
const client = new ConvexHttpClient(process.env["CONVEX_URL"]!);

const chatModel = new ChatOpenAI();
const splitter = new RecursiveCharacterTextSplitter();

const app = new Elysia()
	.use(cors())
	.use(
		rateLimit({
			max: 10,
			duration: 60_000,
		})
	)
	.use(
		swagger({
			documentation: {
				info: {
					title: "Elysia Documentation",
					version: "1.0.0",
				},
			},
		})
	)
	.use(
		jwt({
			name: "jwt",
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			secret: process.env["JWT_SECRET"]!,
			exp: "1d",
		})
	)
	.use(
		logger({
			level: "info",
			browser: { asObject: false },
			timestamp: true,
		})
	)
	.state({ uid: "" });

app.post(
	"signup",
	async ({ body }) => {
		const securePassword = createHash("sha256")
			.update(body.password)
			.digest("hex");

		try {
			await client.mutation(api.files.createUser, {
				email: body.email,
				password: securePassword,
				role: "user",
			});

			// TODO! Send email verification link

			return new Response(
				JSON.stringify({ message: "Created successfully" }),
				{
					status: 200,
					statusText: "OK",
					headers: { "Content-Type": "application/json" },
				}
			);
		} catch (error) {
			if (error instanceof Error) {
				return new Response(
					JSON.stringify({
						message: error.message.split("\n")[1].split(":")[1],
					}),
					{
						status: 409,
						statusText: "Duplicate",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			return new Response(
				JSON.stringify({ message: "Internal Server Error" }),
				{
					status: 500,
					statusText: "Internal Server Error",
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	},
	{
		body: t.Object({
			email: t.String({ format: "email", title: "Email" }),
			password: t.String({
				minLength: 8,
				title: "Password",
				description: "Password must be at least 8 characters",
			}),
		}),
		type: "application/json",
	}
);

app.post(
	"signin",
	async ({ body, jwt }) => {
		const securePassword = createHash("sha256")
			.update(body.password)
			.digest("hex");

		try {
			const user = await client.query(api.files.getUserByEmail, {
				email: body.email,
			});

			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid credentials" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			if (user.password !== securePassword) {
				return new Response(
					JSON.stringify({ message: "Invalid credentials" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			// Remove password from user object
			const { password, ...emptyUser } = user;

			const token = await jwt.sign(emptyUser);

			return new Response(JSON.stringify({ token, user: emptyUser }), {
				status: 200,
				statusText: "OK",
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			if (error instanceof Error) {
				return new Response(
					JSON.stringify({
						message: error.message.split("\n")[1].split(":")[1],
					}),
					{
						status: 404,
						statusText: "Not Found",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			return new Response(
				JSON.stringify({ message: "Internal Server Error" }),
				{
					status: 500,
					statusText: "Internal Server Error",
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	},
	{
		body: t.Object({
			email: t.String({ format: "email", title: "Email" }),
			password: t.String({ minLength: 8, title: "Password" }),
		}),
	}
);

app.get(
	"validate/:token",
	async ({ params, jwt }) => {
		try {
			const user = await jwt.verify(params.token);
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			return new Response(JSON.stringify({ user }), {
				status: 200,
				statusText: "OK",
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			if (error instanceof Error) {
				return new Response(
					JSON.stringify({ message: error.message }),
					{
						status: 404,
						statusText: "Not Found",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			return new Response(
				JSON.stringify({ message: "Internal Server Error" }),
				{
					status: 500,
					statusText: "Internal Server Error",
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	},
	{
		params: t.Object({
			token: t.String(),
		}),
	}
);

app.onBeforeHandle((request) => {
	// biome-ignore lint/complexity/useLiteralKeys: <explanation>
	if (
		request.request.headers.get("origin") !== process.env["ORIGIN"] &&
		request.request.headers.get("referer") !== process.env["REFERER"]
	) {
		return JSON.stringify({
			message: "Not allowed",
			status: 403,
			statusText: "Forbidden",
		});
	}
});

app.get(
	"/",
	async ({ store }) => {
		const files = await client.query(api.files.getUserFiles, {
			userId: store.uid as Id<"users">,
		});
		
		return new Response(JSON.stringify(files), {
			status: 200,
			statusText: "OK",
			headers: { "Content-Type": "application/json" },
		});
	},
	{
		beforeHandle: async ({ jwt, request, store }) => {
			const user = (await jwt.verify(
				request.headers.get("token") ?? undefined
			)) as { _id: string };
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			store.uid = user._id;
		},
	}
);

// !DEPRECATED
app.post(
	"/",
	async ({ body }) => {
		const matches = await client.action(api.myActions.search, {
			query: body.message,
		});

		const prompt = ChatPromptTemplate.fromTemplate(
			"Answer the following question based only on the provided context:  <context>  {context}  </context>  Question: {input} Answer: <format> markdown <format>"
		);

		const documentChain = await createStuffDocumentsChain({
			llm: chatModel,
			prompt,
		});

		const metadata = JSON.parse(matches.resultOne);

		return await documentChain.invoke(
			{
				input: body.message,
				context: metadata,
			},
			{
				metadata: metadata[0]?.metadata,
			}
		);
	},
	{
		body: t.Object({
			message: t.String({ default: "Hello World" }),
		}),
		beforeHandle: async ({ jwt, request, store }) => {
			const user = (await jwt.verify(
				request.headers.get("token") ?? undefined
			)) as { _id: string };
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			store.uid = user._id;
		},
	}
);

app.post(
	"/file",
	async ({ body }) => {
		try {
			body.files.map(async (file: File) => {
				const loader = new PDFLoader(file, {
					parsedItemSeparator: "",
					splitPages: true,
				});

				const docs = await loader.load();

				const newFiles = await client.mutation(api.files.createFile, {
					name: file.name,
					owner: body.owner as Id<"users">,
				});

				for (const doc of docs) {
					// biome-ignore lint/complexity/useLiteralKeys: <explanation>
					doc.metadata["source"] = file.name;
					// biome-ignore lint/complexity/useLiteralKeys: <explanation>
					doc.metadata["docId"] = newFiles;
				}

				const splitDocs = await splitter.splitDocuments(docs);

				const response = await client.action(api.myActions.ingest, {
					texts: splitDocs.map((doc) => doc.pageContent),
					metadata: splitDocs.map((doc) =>
						JSON.stringify(doc.metadata)
					),
				});

				return new Response(JSON.stringify(response), {
					status: 200,
					statusText: "OK",
					headers: { "Content-Type": "application/json" },
				});
			});
		} catch (error) {
			return new Response(
				JSON.stringify({ error: (error as Error).message }),
				{
					status: 500,
					statusText: "Internal Server Error",
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	},
	{
		body: t.Object({
			files: t.Files({ type: "application/pdf", readOnly: true }),
			owner: t.String({ default: "j97cjrjqz99n61h7jm05qz9wsh6pnptq" }),
		}),
		beforeHandle: async ({ jwt, request }) => {
			const user = await jwt.verify(
				request.headers.get("token") ?? undefined
			);
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		},
	}
);

app.delete(
	"/file/:id",
	async ({ params }) => {
		const file = await client.mutation(api.files.deleteFile, {
			id: params.id as Id<"files">,
		});
		return new Response(JSON.stringify(file), {
			status: 200,
			statusText: "OK",
			headers: { "Content-Type": "application/json" },
		});
	},
	{
		params: t.Object({
			id: t.String({
				minLength: 30,
				maxLength: 50,
			}),
		}),
		headers: t.Object({
			token: t.String(),
		}),
		beforeHandle: async ({ jwt, request }) => {
			const user = await jwt.verify(
				request.headers.get("token") ?? undefined
			);
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		},
	}
);

app.post(
	"/v2",
	async ({ body }) => {
		const matches = await client.action(api.myActions.search, {
			query: body.message,
		});

		const metadata = JSON.parse(matches.resultOne) as MatchesType[];

		const model = new ChatOpenAI({});

		const answerTemplate =
			'You are an useful Assignment assistant, DocChat, adept at offering assignment assistance. Your expertise lies in providing answer on top of provided context. You can leverage the chat history if needed. Answer the question based on the context below. Keep the answer correct, clear, detailed and with examples. Respond "I have no information regarding that, please rephrase your query with relevant key words." if not sure about the answer. When using code examples, use the following format: ```(language) copy (code) ``` ----------------  Chat History: <chat_history> {chat_history} </chat_history> \n <context> {context} </context> \n Question: <question>{question}</question>';

		const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

		const formatChatHistory = (chatHistory: [string, string][]) => {
			const formattedDialogueTurns = chatHistory.map(
				(dialogueTurn) =>
					`Human: ${dialogueTurn[0]} \n Assistant: ${dialogueTurn[1]}`
			);
			return formattedDialogueTurns.join("\n");
		};

		const answerChain = RunnableSequence.from([
			{
				question: (input: ConversationalRetrievalQAChainInput) =>
					input.question,
				chat_history: (input: ConversationalRetrievalQAChainInput) =>
					formatChatHistory(input.chat_history),
				context: (input: ConversationalRetrievalQAChainInput) =>
					input.context,
			},
			ANSWER_PROMPT,
			model,
		]);

		const results = await answerChain.invoke({
			question: body.message,
			chat_history: body.history,
			context: metadata.map((match) => match.pageContent).join("\n"),
			metadata: metadata.map((match) => match.metadata),
		});

		return new Response(
			JSON.stringify({
				text: results.content,
			}),
			{
				status: 200,
				statusText: "OK",
				headers: { "Content-Type": "application/json" },
			}
		);
	},
	{
		body: t.Object({
			message: t.String({ default: "Hello World" }),
			history: t.Array(t.Tuple([t.String(), t.String()])),
		}),
		type: "application/json",

		beforeHandle: async ({ jwt, request, store }) => {
			const user = (await jwt.verify(
				request.headers.get("token") ?? undefined
			)) as { _id: string };
			if (!user) {
				return new Response(
					JSON.stringify({ message: "Invalid token" }),
					{
						status: 401,
						statusText: "Unauthorized",
						headers: { "Content-Type": "application/json" },
					}
				);
			}

			store.uid = user._id;
		},
	}
);

// biome-ignore lint/complexity/useLiteralKeys: <explanation>
app.listen(process.env["PORT"] || 3000, (e) => {
	console.log("Server running on port", e.port);
});

interface MatchesType {
	pageContent: string;
	metadata: Metadata2;
}

interface Metadata2 {
	blobType: string;
	docId: string;
	loc: Loc;
	pdf: Pdf;
	source: string;
}

interface Pdf {
	info: Info;
	totalPages: number;
	version: string;
}

interface Info {
	Author: string;
	CreationDate: string;
	Creator: string;
	IsAcroFormPresent: boolean;
	IsXFAPresent: boolean;
	ModDate: string;
	PDFFormatVersion: string;
	Producer: string;
	Title: string;
}

interface Loc {
	lines: Lines;
	pageNumber: number;
}

interface Lines {
	from: number;
	to: number;
}

type ConversationalRetrievalQAChainInput = {
	question: string;
	chat_history: [string, string][];
	context: string;
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	metadata: {}[];
};
