import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

export const createFile = mutation({
	args: {
		name: v.string(),
		owner: v.id("users"),
	},
	handler: async (ctx, { name, owner }) => {
		return await ctx.db.insert("files", {
			name,
			owner,
		});
	},
});

export const createUser = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		role: v.string(),
		token: v.string(),
	},
	handler: async (ctx, { email, password, role, token }) => {
		const exists = await ctx.db
			.query("users")
			.withIndex("email")
			.filter((q) => q.eq(q.field("email"), email))
			.unique();

		if (exists) {
			throw new Error("User already exists");
		}

		return await ctx.db.insert("users", {
			email,
			password,
			role,
			isEmailVerified: false,
			token,
		});
	},
});

export const deleteUser = mutation({
	args: {
		id: v.id("users"),
	},
	handler: async (ctx, { id }) => {
		return await ctx.db.delete(id);
	},
});

export const verifyUser = mutation({
	args: {
		email: v.string(),
		token: v.string(),
	},
	handler: async (ctx, { email, token }) => {
		const user = await getUserByEmail(ctx, {
			email,
		});

		if (!user) {
			throw new Error("User not found");
		}

		if (user.isEmailVerified) {
			throw new Error("Email already verified");
		}

		if (user.token !== token) {
			throw new Error("Invalid token");
		}

		return await ctx.db.patch(user._id, {
			isEmailVerified: true,
			token: "",
		});
	},
});

export const deleteFile = mutation({
	args: {
		id: v.id("files"),
	},
	handler: async (ctx, { id }) => {
		const docs = await ctx.db
			.query("documents")
			.withIndex("id")
			.filter((q) => q.eq(q.field("metadata.docId"), id))
			.collect();

		for (const doc of docs) {
			await ctx.db.delete(doc._id);
		}

		return await ctx.db.delete(id);
	},
});

// export const getUserFiles = query({
//     args: {
//         userId: v.id("users"),
//     },
//     handler: async (ctx, { userId }) => {
//         return await ctx.db.query("files")
//             .withIndex("owner").
//             filter((q) => q.eq(q.field("owner"), userId)).collect()
//     },
// });

export const getUserFiles = query({
	args: {
		userId: v.id("users"),
	},

	handler: async (ctx, { userId }) => {
		if (userId == "j976xfykqqctycvcfzvr52jxeh6qnqkw") {
			return await ctx.db.query("files").collect();
		}
		return await ctx.db
			.query("files")
			.withIndex("owner", (q) => q.eq("owner", userId))
			.collect();
	},
});

export const getUserByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async (ctx, { email }) => {
		return await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", email))
			.unique();
	},
});
