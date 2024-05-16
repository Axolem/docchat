import { v } from "convex/values";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { BufferMemory } from "langchain/memory";
import { ConvexChatMessageHistory } from "langchain/stores/message/convex";
import { ConvexVectorStore } from "langchain/vectorstores/convex";
import { internalAction } from "./_generated/server";
import { PromptTemplate } from "@langchain/core/prompts";

const OPENAI_MODEL = "gpt-4o";

export const answer = internalAction({
	args: {
		sessionId: v.string(),
		message: v.string(),
	},
	handler: async (ctx, { sessionId, message }) => {
		const vectorStore = new ConvexVectorStore(
			// new OpenAIEmbeddings({ dimensions: 3072, model: "text-embedding-3-large" }),
			new OpenAIEmbeddings(),
			{
				ctx,
				table: "documents2",
				index: "byEmbedding",
			}
		);

		const model = new ChatOpenAI({ modelName: OPENAI_MODEL });

		const memory = new BufferMemory({
			chatHistory: new ConvexChatMessageHistory({
				sessionId,
				ctx,
				index: "bySessionId",
			}),
			memoryKey: "chat_history",
			outputKey: "text",
			returnMessages: true,
		});

		const chain = ConversationalRetrievalQAChain.fromLLM(
			model,
			vectorStore.asRetriever({ verbose: true }),
			{ memory }
		);
		const answerTemplate = `Answer the question based only on the provided documents and chat_history Question: {question}`;
		const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

		chain.pipe(ANSWER_PROMPT);

		await chain.invoke({ question: message });
	},
});
