import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Obtenir l'utilisateur actuellement connecté
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Récupérer l'identité de l'utilisateur depuis le contexte
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Chercher l'utilisateur dans la base de données
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email || ""))
      .first();

    return user;
  },
});

// Mutation: Inscription (Sign Up)
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Créer le nouvel utilisateur
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: "user",
      createdAt: Date.now(),
      questionsAsked: 0,
      questionsLimit: 2,
    });

    return { userId, email: args.email, name: args.name };
  },
});

// Mutation: Connexion (Sign In)
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Chercher l'utilisateur
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }

    // Dans une vraie application, vous vérifieriez le mot de passe hashé
    // Pour cette démo, nous retournons simplement l'utilisateur
    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

// Mutation: Déconnexion
export const signOut = mutation({
  args: {},
  handler: async (ctx) => {
    // La déconnexion est gérée côté client
    return { success: true };
  },
});
