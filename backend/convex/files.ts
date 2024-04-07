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
    },
    handler: async (ctx, { email, password, role }) => {

        const exists = await ctx.db.query("users").withIndex("email").filter((q) => q.eq(q.field("email"), email)).unique();

        if (exists) {
            throw new Error("User already exists");
        }

        return await ctx.db.insert("users", {
            email,
            password,
            role,
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

export const deleteFile = mutation({
    args: {
        id: v.id("files"),
    },
    handler: async (ctx, { id }) => {
        const docs = await ctx.db.query("documents")
            .withIndex("id")
            .filter((q) => q.eq(q.field("metadata.docId"), id))
            .collect();

        for (const doc of docs) {
            await ctx.db.delete(doc._id);
        }

        return await ctx.db.delete(id);
    },
});

export const getUserFiles = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        // return await ctx.db.query("files")
        //     .withIndex("owner").
        //     filter((q) => q.eq(q.field("owner"), userId)).collect()
        return await ctx.db.query("files").collect();
    },
});

export const getUserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, { email }) => {
        return await ctx.db.query("users")
            .withIndex("email")
            .filter((q) => q.eq(q.field("email"), email))
            .unique();
    },
});

