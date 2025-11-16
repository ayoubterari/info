import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Créer une nouvelle demande d'aide
export const createDemande = mutation({
  args: {
    userId: v.id("users"), // Rendre userId obligatoire
    title: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.optional(v.number()),
    audioStorageId: v.optional(v.string()),
    fileStorageIds: v.optional(v.array(v.object({
      storageId: v.string(),
      name: v.string(),
      size: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est authentifié
    if (!args.userId) {
      throw new Error("Vous devez être connecté pour soumettre une demande");
    }

    const now = Date.now();
    
    const demandeId = await ctx.db.insert("demandes", {
      userId: args.userId,
      title: args.title,
      category: args.category,
      description: args.description,
      price: args.price,
      duration: args.duration,
      audioStorageId: args.audioStorageId,
      fileStorageIds: args.fileStorageIds,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return demandeId;
  },
});

// Récupérer toutes les demandes d'un utilisateur
export const getUserDemandes = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return demandes;
  },
});

// Récupérer toutes les demandes (pour les admins ou affichage public)
export const getAllDemandes = query({
  args: {},
  handler: async (ctx) => {
    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_date")
      .order("desc")
      .collect();

    // Enrichir avec les URLs des fichiers
    const demandesWithUrls = await Promise.all(
      demandes.map(async (demande) => {
        let audioUrl = null;
        if (demande.audioStorageId) {
          audioUrl = await ctx.storage.getUrl(demande.audioStorageId);
        }

        let fileUrls = null;
        if (demande.fileStorageIds) {
          fileUrls = await Promise.all(
            demande.fileStorageIds.map(async (file) => ({
              url: await ctx.storage.getUrl(file.storageId),
              name: file.name,
              size: file.size,
            }))
          );
        }

        return {
          ...demande,
          audioUrl,
          fileUrls,
        };
      })
    );

    return demandesWithUrls;
  },
});

// Mettre à jour le statut d'une demande
export const updateDemandeStatus = mutation({
  args: {
    demandeId: v.id("demandes"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.demandeId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Supprimer une demande
export const deleteDemande = mutation({
  args: {
    demandeId: v.id("demandes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.demandeId);
    return { success: true };
  },
});
