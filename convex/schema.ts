import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    stem: v.string(), // e.g., "a1b2"
    url: v.string(),  // e.g., "https://google.com"
  }).index("by_stem", ["stem"]),
});