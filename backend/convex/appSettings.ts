import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Récupérer un paramètre par sa clé
export const getSetting = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return setting;
  },
});

// Récupérer tous les paramètres
export const getAllSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("appSettings").collect();
    return settings;
  },
});

// Récupérer le taux de commission (avec valeur par défaut de 10%)
export const getCommissionRate = query({
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    // Retourner 10% par défaut si pas configuré
    return setting ? Number(setting.value) : 10;
  },
});

// Mettre à jour ou créer un paramètre
export const updateSetting = mutation({
  args: {
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean()),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Seuls les administrateurs peuvent modifier les paramètres");
    }

    // Chercher si le paramètre existe déjà
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      // Mettre à jour
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updatedBy: args.userId,
        updatedAt: Date.now(),
      });
      return { success: true, action: "updated", settingId: existing._id };
    } else {
      // Créer
      const settingId = await ctx.db.insert("appSettings", {
        key: args.key,
        value: args.value,
        description: args.description,
        updatedBy: args.userId,
        updatedAt: Date.now(),
      });
      return { success: true, action: "created", settingId };
    }
  },
});

// Initialiser les paramètres par défaut
export const initializeDefaultSettings = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est admin
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Seuls les administrateurs peuvent initialiser les paramètres");
    }

    // Vérifier si commission_rate existe déjà
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    if (!existing) {
      await ctx.db.insert("appSettings", {
        key: "commission_rate",
        value: 10,
        description: "Taux de commission de la plateforme en pourcentage",
        updatedBy: args.userId,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
