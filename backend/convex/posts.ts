import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Récupérer tous les posts publiés
export const getPublishedPosts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
  },
});

// Query: Récupérer tous les posts (admin)
export const getAllPosts = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

// Query: Récupérer un post par ID
export const getPostById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Récupérer les posts d'un auteur
export const getPostsByAuthor = query({
  args: { authorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();
  },
});

// Mutation: Créer un nouveau post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      published: args.published,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Mutation: Mettre à jour un post
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

// Mutation: Supprimer un post
export const deletePost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    // Supprimer aussi tous les commentaires associés
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation: Publier/dépublier un post
export const togglePublishPost = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post non trouvé");
    }

    await ctx.db.patch(args.id, {
      published: !post.published,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
