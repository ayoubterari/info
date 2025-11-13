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

// Terminer une session meet
export const endMeetSession = mutation({
  args: {
    sessionId: v.id("meetSessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: "completed",
      endedAt: Date.now(),
    });

    return { success: true };
  },
});
