import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table des utilisateurs
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
    tokenIdentifier: v.optional(v.string()),
    questionsAsked: v.optional(v.number()), // Compteur de questions posées
    questionsLimit: v.optional(v.number()), // Limite de questions (par défaut 2)
    // Stripe Connect fields
    stripeConnectAccountId: v.optional(v.string()), // ID du compte Stripe Connect
    stripeOnboardingComplete: v.optional(v.boolean()), // Onboarding terminé
    stripeBankAccountLast4: v.optional(v.string()), // 4 derniers chiffres du compte bancaire
    stripeAccountStatus: v.optional(v.string()), // active, pending, restricted
  })
    .index("by_email", ["email"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_stripe_account", ["stripeConnectAccountId"]),

  // Table des articles/posts
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_published", ["published"]),

  // Table des commentaires
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  // Table des conversations avec l'IA
  conversations: defineTable({
    userId: v.optional(v.id("users")),
    userMessage: v.string(),
    aiResponse: v.string(),
    agentName: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["createdAt"]),

  // Table des demandes d'aide
  demandes: defineTable({
    userId: v.optional(v.id("users")),
    title: v.string(),
    category: v.string(),
    description: v.string(),
    price: v.number(), // Prix proposé en dollars
    duration: v.optional(v.number()), // Durée estimée en minutes
    audioStorageId: v.optional(v.string()), // ID de stockage Convex pour l'audio
    fileStorageIds: v.optional(v.array(v.object({
      storageId: v.string(),
      name: v.string(),
      size: v.number(),
    }))), // IDs de stockage Convex pour les fichiers
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"]),

  // Table des offres d'aide
  offres: defineTable({
    demandeId: v.id("demandes"), // Référence à la demande
    userId: v.optional(v.id("users")), // Utilisateur qui propose son aide
    proposedPrice: v.number(), // Prix proposé par l'helper
    message: v.string(), // Message texte
    audioStorageId: v.optional(v.string()), // ID de stockage Convex pour l'audio
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    meetSessionId: v.optional(v.string()), // ID de la session meet si acceptée
    createdAt: v.number(),
  })
    .index("by_demande", ["demandeId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Table des sessions de meet
  meetSessions: defineTable({
    offreId: v.id("offres"), // Référence à l'offre acceptée
    demandeId: v.id("demandes"), // Référence à la demande
    demandeurId: v.id("users"), // Propriétaire de la demande
    offreurId: v.id("users"), // Utilisateur qui a fait l'offre
    callId: v.string(), // ID unique de l'appel Stream.io
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
    paymentMethod: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_offre", ["offreId"])
    .index("by_demande", ["demandeId"])
    .index("by_demandeur", ["demandeurId"])
    .index("by_offreur", ["offreurId"])
    .index("by_status", ["status"]),

  // Table des paramètres de l'application
  appSettings: defineTable({
    key: v.string(), // Clé unique du paramètre (ex: "commission_rate")
    value: v.union(v.string(), v.number(), v.boolean()), // Valeur du paramètre
    description: v.optional(v.string()), // Description du paramètre
    updatedBy: v.optional(v.id("users")), // Qui a modifié en dernier
    updatedAt: v.number(), // Date de dernière modification
  })
    .index("by_key", ["key"]),

  // Table des transactions/commissions
  transactions: defineTable({
    sessionId: v.id("meetSessions"), // Référence à la session
    offreId: v.id("offres"), // Référence à l'offre
    demandeurId: v.id("users"), // Demandeur (qui paie)
    offreurId: v.id("users"), // Prestataire (qui reçoit)
    totalAmount: v.number(), // Montant total payé
    commissionRate: v.number(), // Taux de commission appliqué (%)
    commissionAmount: v.number(), // Montant de la commission
    providerAmount: v.number(), // Montant reçu par le prestataire
    // Stripe fields
    stripePaymentIntentId: v.optional(v.string()), // ID du Payment Intent Stripe
    stripeTransferId: v.optional(v.string()), // ID du Transfer Stripe vers le prestataire
    stripePaymentMethod: v.optional(v.string()), // Méthode de paiement (card, bank_transfer, etc.)
    stripeFees: v.optional(v.number()), // Frais Stripe (2.9% + $0.30)
    status: v.union(
      v.literal("pending"), 
      v.literal("completed"), 
      v.literal("refunded"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_demandeur", ["demandeurId"])
    .index("by_offreur", ["offreurId"])
    .index("by_stripe_payment", ["stripePaymentIntentId"])
    .index("by_status", ["status"]),
});
