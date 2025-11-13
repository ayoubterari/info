import { v } from "convex/values";
import { query } from "./_generated/server";

// Récupérer les statistiques du dashboard pour un utilisateur
export const getUserStats = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }

    // Récupérer les demandes de l'utilisateur
    const userDemandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Récupérer les offres envoyées par l'utilisateur
    const userOffres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Récupérer les offres reçues (sur les demandes de l'utilisateur)
    const offresRecues = await Promise.all(
      userDemandes.map(async (demande) => {
        return await ctx.db
          .query("offres")
          .withIndex("by_demande", (q) => q.eq("demandeId", demande._id))
          .collect();
      })
    );
    const flatOffresRecues = offresRecues.flat();

    // Calculer les statistiques
    const stats = {
      // Demandes
      totalDemandes: userDemandes.length,
      demandesPending: userDemandes.filter(d => d.status === 'pending').length,
      demandesInProgress: userDemandes.filter(d => d.status === 'in_progress').length,
      demandesCompleted: userDemandes.filter(d => d.status === 'completed').length,
      
      // Offres envoyées
      totalOffresEnvoyees: userOffres.length,
      offresEnvoyeesPending: userOffres.filter(o => o.status === 'pending').length,
      offresEnvoyeesAccepted: userOffres.filter(o => o.status === 'accepted').length,
      offresEnvoyeesRejected: userOffres.filter(o => o.status === 'rejected').length,
      
      // Offres reçues
      totalOffresRecues: flatOffresRecues.length,
      offresRecuesPending: flatOffresRecues.filter(o => o.status === 'pending').length,
      offresRecuesAccepted: flatOffresRecues.filter(o => o.status === 'accepted').length,
      offresRecuesRejected: flatOffresRecues.filter(o => o.status === 'rejected').length,
      
      // Montants
      totalMontantDemandes: userDemandes.reduce((sum, d) => sum + d.price, 0),
      totalMontantOffresEnvoyees: userOffres.reduce((sum, o) => sum + o.proposedPrice, 0),
      totalMontantOffresRecues: flatOffresRecues.reduce((sum, o) => sum + o.proposedPrice, 0),
    };

    return stats;
  },
});

// Récupérer les activités récentes de l'utilisateur
export const getRecentActivity = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const limit = args.limit || 10;

    // Récupérer les demandes récentes
    const recentDemandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Récupérer les offres récentes envoyées
    const recentOffres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    // Combiner et enrichir les activités
    const activities = [];

    for (const demande of recentDemandes) {
      activities.push({
        type: 'demande',
        id: demande._id,
        title: demande.title,
        status: demande.status,
        price: demande.price,
        category: demande.category,
        createdAt: demande.createdAt,
      });
    }

    for (const offre of recentOffres) {
      const demande = await ctx.db.get(offre.demandeId);
      activities.push({
        type: 'offre',
        id: offre._id,
        title: demande?.title || 'Demande supprimée',
        status: offre.status,
        price: offre.proposedPrice,
        demandePrice: demande?.price,
        createdAt: offre.createdAt,
      });
    }

    // Trier par date et limiter
    return activities
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});
