import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Générer une URL d'upload pour un fichier
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Obtenir l'URL de téléchargement d'un fichier
export const getFileUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
