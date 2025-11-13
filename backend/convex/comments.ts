import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Récupérer les commentaires d'un post
export const getCommentsByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
  },
});

// Query: Récupérer les commentaires d'un utilisateur
export const getCommentsByAuthor = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});

// Query: Récupérer un commentaire par ID
export const getCommentById = query({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation: Créer un nouveau commentaire
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

// Mutation: Mettre à jour un commentaire
export const updateComment = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      content: args.content,
    });
    return args.id;
  },
});

// Mutation: Supprimer un commentaire
export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
