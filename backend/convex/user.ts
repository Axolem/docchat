import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const getUserById = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, { userId }) => {
		return await ctx.db.get(userId);
	},
});

export const clearAllCalls = internalMutation(async (ctx) => {
	for (const message of await ctx.db.query("users").collect()) {
		await ctx.db.patch(message._id, { calls: 0 });
	}
});

// get calls
export const getCalls = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, { userId }) => {
		const user = await ctx.db.get(userId);
		return {
			calls: user?.calls || 0,
		};
	},
});
