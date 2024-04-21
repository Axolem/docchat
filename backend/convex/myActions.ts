"use node";

import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { OpenAIEmbeddings } from "@langchain/openai";
import { action } from "./_generated/server.js";
import { v } from "convex/values";

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

			await ConvexVectorStore.fromTexts(
				texts,
				meta,
				new OpenAIEmbeddings({
					modelName: "text-embedding-3-large",
				}),
				{ ctx }
			);

			return { message: "Success" };
		} catch (error) {
			throw new Error((error as Error).message);
		}
	},
});
/*
export const ingestDocs = action({
    args: {
        documents: v.array(v.string()),
    },
    handler: async (ctx, { documents }) => {
        return await ConvexVectorStore.fromDocuments(
            documents.map((doc) => JSON.parse(doc)),
            new OpenAIEmbeddings(), { ctx }
        )
    },
});
*/

export const search = action({
	args: {
		query: v.string(),
	},
	handler: async (ctx, args) => {
		const vectorStore = new ConvexVectorStore(new OpenAIEmbeddings(), {
			ctx,
		});

		const resultOne = await vectorStore.similaritySearch(args.query, 1);

		return {
			resultOne: JSON.stringify(resultOne),
		};
	},
});
