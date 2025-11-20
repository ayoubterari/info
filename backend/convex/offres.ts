import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Créer une nouvelle offre d'aide
export const createOffre = mutation({
  args: {
    demandeId: v.id("demandes"),
    userId: v.id("users"), // Rendre userId obligatoire
    proposedPrice: v.number(),
    message: v.string(),
    audioStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier que l'utilisateur est authentifié
    if (!args.userId) {
      throw new Error("Vous devez être connecté pour proposer une offre");
    }

    const offreId = await ctx.db.insert("offres", {
      demandeId: args.demandeId,
      userId: args.userId,
      proposedPrice: args.proposedPrice,
      message: args.message,
      audioStorageId: args.audioStorageId,
      status: "pending",
      createdAt: Date.now(),
    });

    return offreId;
  },
});

// Récupérer une offre par son ID
export const getOffreById = query({
  args: {
    id: v.id("offres"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Récupérer toutes les offres pour une demande
export const getOffresByDemande = query({
  args: {
    demandeId: v.id("demandes"),
  },
  handler: async (ctx, args) => {
    const offres = await ctx.db
      .query("offres")
      .withIndex("by_demande", (q) => q.eq("demandeId", args.demandeId))
      .order("desc")
      .collect();

    return offres;
  },
});

// Récupérer toutes les offres pour une demande avec détails utilisateur
export const getOffresByDemandeWithUser = query({
  args: {
    demandeId: v.id("demandes"),
  },
  handler: async (ctx, args) => {
    const offres = await ctx.db
      .query("offres")
      .withIndex("by_demande", (q) => q.eq("demandeId", args.demandeId))
      .order("desc")
      .collect();

    // Enrichir avec les détails de l'utilisateur et l'URL audio
    const offresWithDetails = await Promise.all(
      offres.map(async (offre) => {
        let user = null;
        if (offre.userId) {
          user = await ctx.db.get(offre.userId);
        }

        let audioUrl = null;
        if (offre.audioStorageId) {
          audioUrl = await ctx.storage.getUrl(offre.audioStorageId);
        }

        return {
          ...offre,
          user: user ? { name: user.name, email: user.email } : null,
          audioUrl,
        };
      })
    );

    return offresWithDetails;
  },
});

// Récupérer les offres d'un utilisateur (offres qu'il a faites)
export const getUserOffres = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const offres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return offres;
  },
});

// Récupérer les offres envoyées par un utilisateur avec détails des demandes
export const getUserOffresWithDemandes = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const offres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Enrichir avec les détails de la demande
    const offresWithDemandes = await Promise.all(
      offres.map(async (offre) => {
        const demande = await ctx.db.get(offre.demandeId);
        
        let audioUrl = null;
        if (offre.audioStorageId) {
          audioUrl = await ctx.storage.getUrl(offre.audioStorageId);
        }

        return {
          ...offre,
          demande: demande ? {
            _id: demande._id,
            title: demande.title,
            category: demande.category,
            price: demande.price,
            status: demande.status,
          } : null,
          audioUrl,
        };
      })
    );

    return offresWithDemandes;
  },
});

// Récupérer les offres proposées par un utilisateur (pour le prestataire)
export const getOffresProposees = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const offres = await ctx.db
      .query("offres")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Enrichir avec les détails de la demande et de la session
    const offresEnrichies = await Promise.all(
      offres.map(async (offre) => {
        const demande = await ctx.db.get(offre.demandeId);
        
        let audioUrl = null;
        if (offre.audioStorageId) {
          audioUrl = await ctx.storage.getUrl(offre.audioStorageId);
        }

        // Si l'offre est acceptée, récupérer la session meet
        let meetSessionId = null;
        let paymentCompleted = false;
        if (offre.status === "accepted" && offre.meetSessionId) {
          meetSessionId = offre.meetSessionId;
          // Vérifier le statut de paiement en cherchant la session
          const session = await ctx.db
            .query("meetSessions")
            .filter((q) => q.eq(q.field("offreId"), offre._id))
            .first();
          if (session && session.paymentStatus === "completed") {
            paymentCompleted = true;
          }
        }

        return {
          ...offre,
          demande: demande ? {
            _id: demande._id,
            title: demande.title,
            category: demande.category,
            description: demande.description,
            price: demande.price,
            status: demande.status,
          } : null,
          audioUrl,
          meetSessionId,
          paymentCompleted,
        };
      })
    );

    return offresEnrichies;
  },
});

// Récupérer les offres reçues par un utilisateur (offres sur ses demandes)
export const getOffresRecues = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    // Récupérer toutes les demandes de l'utilisateur
    const userDemandes = await ctx.db
      .query("demandes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Récupérer toutes les offres pour ces demandes
    const offresRecues = await Promise.all(
      userDemandes.map(async (demande) => {
        const offres = await ctx.db
          .query("offres")
          .withIndex("by_demande", (q) => q.eq("demandeId", demande._id))
          .order("desc")
          .collect();

        // Enrichir chaque offre avec les détails de la demande et de l'utilisateur
        return Promise.all(
          offres.map(async (offre) => {
            let user = null;
            if (offre.userId) {
              user = await ctx.db.get(offre.userId);
            }

            let audioUrl = null;
            if (offre.audioStorageId) {
              audioUrl = await ctx.storage.getUrl(offre.audioStorageId);
            }

            return {
              ...offre,
              demande: {
                _id: demande._id,
                title: demande.title,
                category: demande.category,
                price: demande.price,
                userId: demande.userId,
              },
              user: user ? { name: user.name, email: user.email } : null,
              audioUrl,
            };
          })
        );
      })
    );

    // Aplatir le tableau et trier par date
    return offresRecues.flat().sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Récupérer toutes les offres (simple)
export const getAllOffres = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("offres").order("desc").collect();
  },
});

// Récupérer toutes les offres avec les détails des demandes
export const getAllOffresWithDemandes = query({
  args: {},
  handler: async (ctx) => {
    const offres = await ctx.db
      .query("offres")
      .order("desc")
      .collect();

    // Enrichir chaque offre avec les détails de la demande et les URLs
    const offresWithDemandes = await Promise.all(
      offres.map(async (offre) => {
        const demande = await ctx.db.get(offre.demandeId);
        
        // Récupérer l'URL audio de l'offre
        let audioUrl = null;
        if (offre.audioStorageId) {
          audioUrl = await ctx.storage.getUrl(offre.audioStorageId);
        }
        
        return {
          ...offre,
          audioUrl,
          demande,
        };
      })
    );

    return offresWithDemandes;
  },
});

// Mettre à jour le statut d'une offre
export const updateOffreStatus = mutation({
  args: {
    offreId: v.id("offres"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const offre = await ctx.db.get(args.offreId);
    if (!offre) {
      throw new Error("Offre not found");
    }

    await ctx.db.patch(args.offreId, {
      status: args.status,
    });

    // Si l'offre est acceptée, créer une session meet
    if (args.status === "accepted" && offre.userId) {
      const demande = await ctx.db.get(offre.demandeId);
      if (!demande || !demande.userId) {
        throw new Error("Demande or demandeur not found");
      }

      // Vérifier si une session existe déjà pour cette offre
      if (offre.meetSessionId) {
        console.log("Session already exists for this offer:", offre.meetSessionId);
        // Récupérer la session existante
        const existingSession = await ctx.db
          .query("meetSessions")
          .filter((q) => q.eq(q.field("offreId"), args.offreId))
          .first();
        
        if (existingSession) {
          return { 
            success: true, 
            meetSessionId: existingSession._id, 
            callId: existingSession.callId 
          };
        }
      }

      // Générer un ID unique pour l'appel (max 64 caractères)
      // Utiliser un hash court basé sur l'offre ID et timestamp
      const timestamp = Date.now().toString(36); // Base 36 pour raccourcir
      const offreIdShort = args.offreId.substring(0, 16); // Prendre les 16 premiers caractères
      const callId = `meet_${offreIdShort}_${timestamp}`;

      // Créer la session meet
      const meetSessionId = await ctx.db.insert("meetSessions", {
        offreId: args.offreId,
        demandeId: offre.demandeId,
        demandeurId: demande.userId,
        offreurId: offre.userId,
        callId,
        status: "active",
        createdAt: Date.now(),
      });

      // Mettre à jour l'offre avec l'ID de la session
      await ctx.db.patch(args.offreId, {
        meetSessionId: meetSessionId,
      });

      return { success: true, meetSessionId, callId };
    }

    return { success: true };
  },
});
