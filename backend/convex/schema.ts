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
	}).index("email", ["email"]),
});
