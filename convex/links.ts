import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const getLink = query({
  args: { stem: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_stem", (q) => q.eq("stem", args.stem))
      .unique();
  },
});

export const createLink = mutation({
  args: { url: v.string(), customStem: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let targetUrl = args.url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    // 1. Determine the stem (use custom or generate random)
    const stem = args.customStem?.trim() || Math.random().toString(36).substring(2, 6);

    // 2. Check if it's already taken
    const existing = await ctx.db
      .query("links")
      .withIndex("by_stem", (q) => q.eq("stem", stem))
      .unique();

    if (existing) {
      throw new ConvexError("That stem is already taken. Try another!");
    }

    // 3. Save
    await ctx.db.insert("links", { stem, url: targetUrl });
    return stem;
  },
});