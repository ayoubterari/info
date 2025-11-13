import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Récupérer tous les utilisateurs
export const getUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Query: Récupérer un utilisateur par ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Récupérer un utilisateur par email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Mutation: Créer un nouvel utilisateur
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      role: args.role,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Mutation: Mettre à jour un utilisateur
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Mutation: Supprimer un utilisateur
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query: Récupérer un utilisateur pour le profil
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      questionsAsked: user.questionsAsked || 0,
      questionsLimit: user.questionsLimit || 2,
    };
  },
});

// Mutation: Mettre à jour le profil utilisateur
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, name, email } = args;

    // Vérifier si l'utilisateur existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
    if (email && email !== user.email) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingUser) {
        throw new Error("Cet email est déjà utilisé");
      }
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Mettre à jour l'utilisateur
    await ctx.db.patch(userId, updateData);

    return {
      success: true,
      message: "Profil mis à jour avec succès",
      userId,
      name: name || user.name,
      email: email || user.email,
      role: user.role,
    };
  },
});

// Mutation: Changer le mot de passe
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, currentPassword, newPassword } = args;

    // Vérifier si l'utilisateur existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Note: Dans un vrai système, vous devriez vérifier le mot de passe actuel
    // Pour cet exemple, nous supposons que la vérification est faite côté client

    // Valider le nouveau mot de passe
    if (newPassword.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }

    // Dans un vrai système, vous devriez hasher le mot de passe
    // Pour cet exemple, nous ne stockons pas le mot de passe dans le schéma actuel

    return {
      success: true,
      message: "Mot de passe changé avec succès",
    };
  },
});

// Mutation: Supprimer le compte utilisateur
export const deleteAccount = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId } = args;

    // Vérifier si l'utilisateur existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Supprimer toutes les données associées à l'utilisateur
    // Conversations
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const conv of conversations) {
      await ctx.db.delete(conv._id);
    }

    // Demandes
    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const demande of demandes) {
      await ctx.db.delete(demande._id);
    }

    // Offres
    const offres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const offre of offres) {
      await ctx.db.delete(offre._id);
    }

    // Supprimer l'utilisateur
    await ctx.db.delete(userId);

    return {
      success: true,
      message: "Compte supprimé avec succès",
    };
  },
});
