"use node";

import { load } from "cheerio";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { OpenAIEmbeddings } from "@langchain/openai";
// import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed";
import { ConvexKVStore } from "langchain/storage/convex";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ConvexVectorStore } from "langchain/vectorstores/convex";
import { internal } from "./_generated/api";
import { asyncMap } from "modern-async";

export const fetchAndEmbedSingle = internalAction({
	args: {
		url: v.string(),
	},
	handler: async (ctx, { url }) => {
		const loader = new CheerioWebBaseLoader(url);
		const data = await loader.load();
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});

		const splitDocs = await textSplitter.splitDocuments(data);

		const embeddings = new CacheBackedEmbeddings({
			underlyingEmbeddings: new OpenAIEmbeddings(),
			documentEmbeddingStore: new ConvexKVStore({ ctx }),
		});

		await ConvexVectorStore.fromDocuments(splitDocs, embeddings, { ctx });
	},
});

export const scrapeAndEmbedSite = internalAction({
	args: {
		sitemapUrl: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, { sitemapUrl, limit }) => {
		const response = await fetch(sitemapUrl);
		const xml = await response.text();
		const $ = load(xml, { xmlMode: true });
		const urls = $("url > loc")
			.map((_i, elem) => $(elem).text())
			.get()
			.slice(0, limit);
		await asyncMap(urls, (url: string) =>
			ctx.runAction(internal.google.fetchAndEmbedSingle, { url })
		);
	},
});
