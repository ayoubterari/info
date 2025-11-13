import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Vérifier si l'utilisateur peut poser une question
export const canAskQuestion = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return { canAsk: false, reason: "Utilisateur non trouvé" };
    }

    const questionsAsked = user.questionsAsked || 0;
    const questionsLimit = user.questionsLimit || 2;

    if (questionsAsked >= questionsLimit) {
      return {
        canAsk: false,
        reason: `Limite atteinte (${questionsAsked}/${questionsLimit} questions)`,
        questionsAsked,
        questionsLimit,
      };
    }

    return {
      canAsk: true,
      questionsAsked,
      questionsLimit,
      remaining: questionsLimit - questionsAsked,
    };
  },
});

// Mutation: Incrémenter le compteur de questions
export const incrementQuestionCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const questionsAsked = (user.questionsAsked || 0) + 1;
    const questionsLimit = user.questionsLimit || 2;

    await ctx.db.patch(args.userId, {
      questionsAsked,
    });

    return {
      questionsAsked,
      questionsLimit,
      remaining: questionsLimit - questionsAsked,
    };
  },
});

// Mutation: Réinitialiser le compteur (admin uniquement)
export const resetQuestionCount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      questionsAsked: 0,
    });

    return { success: true };
  },
});

// Query: Obtenir les statistiques de l'utilisateur
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }

    return {
      questionsAsked: user.questionsAsked || 0,
      questionsLimit: user.questionsLimit || 2,
      remaining: (user.questionsLimit || 2) - (user.questionsAsked || 0),
    };
  },
});
