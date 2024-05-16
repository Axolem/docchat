import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	documents: defineTable({
		embedding: v.array(v.number()),
		text: v.string(),
		metadata: v.object({
			docId: v.string(),
			pdf: v.any(),
			loc: v.any(),
			blobType: v.string(),
			source: v.string(),
		}),
	})
		.vectorIndex("byEmbedding", {
			vectorField: "embedding",
			dimensions: 3072,
			filterFields: ["metadata.docId"],
		})
		.index("id", ["metadata.docId"]),
	files: defineTable({
		name: v.string(),
		owner: v.id("users"),
	}).index("owner", ["owner"]),
	users: defineTable({
		email: v.string(),
		password: v.string(),
		role: v.string(),
		isEmailVerified: v.boolean(),
		token: v.optional(v.string()),
		lastLogin: v.optional(v.string()),
		calls: v.optional(v.number()),
	}).index("email", ["email"]),
	// Simple cache to avoid recomputing embeddings
	cache: defineTable({
		// content
		key: v.string(),
		// embedding
		value: v.any(),
	}).index("byKey", ["key"]),
	// one row for each chunk of a document
	documents2: defineTable({
		embedding: v.array(v.number()),
		text: v.string(),
		metadata: v.any(),
	}).vectorIndex("byEmbedding", {
		vectorField: "embedding",
		dimensions: 1536,
		// dimensions: 3072,
	}),
	messages: defineTable({
		// Which conversation this message belongs to
		sessionId: v.string(),
		message: v.object({
			// The message author, either AI or human
			type: v.string(),
			data: v.object({
				// The text of the message
				content: v.string(),
				role: v.optional(v.string()),
				name: v.optional(v.string()),
				additional_kwargs: v.optional(v.any()),
				response_metadata: v.optional(v.any()),
				invalid_tool_calls: v.optional(v.any()),
				tool_calls: v.optional(v.any()),
			}),
		}),
	}).index("bySessionId", ["sessionId"]),
});
