import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation: Sauvegarder une conversation
export const saveConversation = mutation({
  args: {
    userId: v.optional(v.id("users")),
    userMessage: v.string(),
    aiResponse: v.string(),
    agentName: v.string(),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      userId: args.userId,
      userMessage: args.userMessage,
      aiResponse: args.aiResponse,
      agentName: args.agentName,
      createdAt: Date.now(),
    });

    return conversationId;
  },
});

// Query: Récupérer l'historique des conversations
export const getConversations = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let conversationsQuery = ctx.db.query("conversations");

    // Filtrer par utilisateur si fourni
    if (args.userId) {
      conversationsQuery = conversationsQuery.filter((q) =>
        q.eq(q.field("userId"), args.userId)
      );
    }

    // Trier par date décroissante
    const conversations = await conversationsQuery
      .order("desc")
      .take(args.limit || 50);

    return conversations;
  },
});

// Query: Récupérer une conversation par ID
export const getConversationById = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation: Supprimer une conversation
export const deleteConversation = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Mutation: Supprimer tout l'historique
export const clearHistory = mutation({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let conversationsQuery = ctx.db.query("conversations");

    if (args.userId) {
      conversationsQuery = conversationsQuery.filter((q) =>
        q.eq(q.field("userId"), args.userId)
      );
    }

    const conversations = await conversationsQuery.collect();

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    return { deleted: conversations.length };
  },
});
