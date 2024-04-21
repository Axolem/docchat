"use node";

import { action } from "./_generated/server.js";
import { api } from "./_generated/api.js";
import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v } from "convex/values";

const embedding = new OpenAIEmbeddings({
	modelName: "text-embedding-3-large",
});

export const ingest = action({
	args: {
		texts: v.array(v.string()),
		metadata: v.array(v.string()),
	},
	handler: async (ctx, { texts, metadata }) => {
		try {
			const metaJson = metadata.map((m) => JSON.parse(m));
			const meta = metaJson.map((m) => ({
				...m,
				pdf: {
					...m.pdf,
					metadata: {},
				},
			}));

			await ConvexVectorStore.fromTexts(texts, meta, embedding, { ctx });

			return { message: "Success" };
		} catch (error) {
			throw new Error((error as Error).message);
		}
	},
});

export const search = action({
	args: {
		query: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const vectorStore = new ConvexVectorStore(embedding, {
			ctx,
		});

		// Get user documents
		const userDocs = await ctx.runQuery(api.files.getUserFiles, {
			userId: args.userId,
		});

		// Get document ids
		const docIds = userDocs.map((doc) => doc._id);

		const resultOne = await vectorStore.similaritySearch(args.query);

		const result = resultOne.map((r) => {
			if (docIds.includes(r.metadata["docId"])) {
				return r;
			}
		});

		return {
			resultOne: JSON.stringify(result),
		};
	},
});
