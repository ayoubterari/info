import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Récupérer les sessions meet actives d'un utilisateur
export const getUserActiveMeetSessions = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    // Récupérer les sessions où l'utilisateur est demandeur ou offreur
    const sessions = await ctx.db
      .query("meetSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.or(
            q.eq(q.field("demandeurId"), args.userId),
            q.eq(q.field("offreurId"), args.userId)
          )
        )
      )
      .collect();

    // Enrichir avec les détails de la demande et de l'offre
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const demande = await ctx.db.get(session.demandeId);
        const offre = await ctx.db.get(session.offreId);
        
        // Récupérer l'autre utilisateur
        const otherUserId = session.demandeurId === args.userId 
          ? session.offreurId 
          : session.demandeurId;
        const otherUser = await ctx.db.get(otherUserId);

        return {
          ...session,
          demande: demande ? {
            title: demande.title,
            category: demande.category,
          } : null,
          offre: offre ? {
            proposedPrice: offre.proposedPrice,
          } : null,
          otherUser: otherUser ? {
            name: otherUser.name,
            email: otherUser.email,
          } : null,
          isCreator: session.demandeurId === args.userId,
        };
      })
    );

    return enrichedSessions;
  },
});

// Récupérer une session meet par son ID
export const getMeetSession = query({
  args: {
    sessionId: v.id("meetSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    const demande = await ctx.db.get(session.demandeId);
    const offre = await ctx.db.get(session.offreId);
    const demandeur = await ctx.db.get(session.demandeurId);
    const offreur = await ctx.db.get(session.offreurId);

    return {
      ...session,
      demande: demande ? {
        title: demande.title,
        category: demande.category,
        description: demande.description,
        duration: demande.duration, // Ajouter la durée
      } : null,
      offre: offre ? {
        proposedPrice: offre.proposedPrice,
        message: offre.message,
      } : null,
      demandeur: demandeur ? {
        name: demandeur.name,
        email: demandeur.email,
      } : null,
      offreur: offreur ? {
        name: offreur.name,
        email: offreur.email,
      } : null,
    };
  },
});

// Récupérer une session par ID (pour la page de paiement)
export const getSessionById = query({
  args: {
    sessionId: v.id("meetSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    const demande = await ctx.db.get(session.demandeId);
    const demandeur = await ctx.db.get(session.demandeurId);
    const offreur = await ctx.db.get(session.offreurId);
    const offre = await ctx.db.get(session.offreId);

    return {
      ...session,
      demandeTitle: demande?.title || "Service",
      duration: demande?.duration || 30,
      demandeurName: demandeur?.name || "Demandeur",
      helperName: offreur?.name || "Prestataire",
      offre: offre ? {
        proposedPrice: offre.proposedPrice,
      } : null,
    };
  },
});

// Mettre à jour le statut de paiement
export const updatePaymentStatus = mutation({
  args: {
    sessionId: v.id("meetSessions"),
    paymentStatus: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      paymentStatus: args.paymentStatus,
      paymentMethod: args.paymentMethod,
      paidAt: Date.now(),
    });

    return { success: true };
  },
});

// Terminer une session meet
export const endMeetSession = mutation({
  args: {
    sessionId: v.id("meetSessions"),
    isScam: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Mettre à jour le statut de la session
    await ctx.db.patch(args.sessionId, {
      status: args.isScam ? "cancelled" : "completed",
      endedAt: Date.now(),
    });

    // Mettre à jour le statut de la demande
    const newDemandeStatus = args.isScam ? "cancelled" : "completed";
    await ctx.db.patch(session.demandeId, {
      status: newDemandeStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
