import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 🎭 MODE DEMO - Paiements Stripe classiques
// L'application collecte les paiements et les redistribue manuellement

// Créer un Payment Intent pour un paiement
export const createPaymentIntent = mutation({
  args: {
    amount: v.number(), // en dollars
    sessionId: v.id("meetSessions"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session non trouvée");
    }

    // 🎭 DEMO: Générer un faux Payment Intent
    const fakePaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fakeClientSecret = `${fakePaymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`;

    console.log(`✅ [DEMO] Payment Intent créé: ${fakePaymentIntentId} pour $${args.amount}`);

    return {
      clientSecret: fakeClientSecret,
      paymentIntentId: fakePaymentIntentId,
      amount: args.amount,
      message: "🎭 MODE DEMO - Payment Intent simulé",
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(args.amount * 100), // Convertir en centimes
      currency: 'usd',
      metadata: {
        sessionId: args.sessionId,
        demandeurId: session.demandeurId,
        offreurId: session.offreurId,
      },
      description: args.description || `Paiement pour session ${args.sessionId}`,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: args.amount,
    };
    */
  },
});

// Confirmer un paiement et créer la transaction
export const confirmPayment = mutation({
  args: {
    paymentIntentId: v.string(),
    sessionId: v.id("meetSessions"),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session non trouvée");
    }

    const offre = await ctx.db.get(session.offreId);
    if (!offre) {
      throw new Error("Offre non trouvée");
    }

    // Récupérer le taux de commission
    const commissionSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    const commissionRate = commissionSetting ? Number(commissionSetting.value) : 10;

    // Calculer les montants
    const totalAmount = offre.proposedPrice;
    const commissionAmount = (totalAmount * commissionRate) / 100;
    const providerAmount = totalAmount - commissionAmount;
    const stripeFees = (totalAmount * 0.029) + 0.30;

    // Créer la transaction
    const transactionId = await ctx.db.insert("transactions", {
      sessionId: args.sessionId,
      offreId: session.offreId,
      demandeurId: session.demandeurId,
      offreurId: session.offreurId,
      totalAmount,
      commissionRate,
      commissionAmount,
      providerAmount,
      stripePaymentIntentId: args.paymentIntentId,
      stripePaymentMethod: args.paymentMethod || "demo_card",
      stripeFees,
      payoutStatus: "pending", // En attente de redistribution manuelle
      status: "completed",
      createdAt: Date.now(),
    });

    // Mettre à jour le statut de paiement de la session
    await ctx.db.patch(args.sessionId, {
      paymentStatus: "completed",
      paidAt: Date.now(),
    });

    console.log(`💰 Paiement confirmé et transaction créée: ${transactionId}`);
    console.log(`   Total: $${totalAmount}`);
    console.log(`   Commission (${commissionRate}%): $${commissionAmount.toFixed(2)}`);
    console.log(`   Frais Stripe: $${stripeFees.toFixed(2)}`);
    console.log(`   Prestataire recevra: $${providerAmount.toFixed(2)}`);
    console.log(`   ⏳ Payout en attente de traitement manuel`);

    return {
      transactionId,
      totalAmount,
      commissionAmount,
      providerAmount,
      payoutStatus: "pending",
    };
  },
});

// Récupérer les paiements en attente de payout
export const getPendingPayouts = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "completed"),
          q.or(
            q.eq(q.field("payoutStatus"), "pending"),
            q.eq(q.field("payoutStatus"), undefined)
          )
        )
      )
      .order("desc")
      .collect();

    // Enrichir avec les informations utilisateur
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const offreur = await ctx.db.get(transaction.offreurId);
        const demandeur = await ctx.db.get(transaction.demandeurId);
        const session = await ctx.db.get(transaction.sessionId);

        return {
          ...transaction,
          offreurName: offreur?.name || "Inconnu",
          offreurEmail: offreur?.email || "N/A",
          offreurBankInfo: offreur?.bankAccountInfo,
          demandeurName: demandeur?.name || "Inconnu",
          sessionStatus: session?.status || "unknown",
        };
      })
    );

    return enrichedTransactions;
  },
});

// Marquer un payout comme traité (admin)
export const markPayoutAsCompleted = mutation({
  args: {
    transactionId: v.id("transactions"),
    payoutMethod: v.string(),
    payoutReference: v.string(),
    payoutNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction non trouvée");
    }

    await ctx.db.patch(args.transactionId, {
      payoutStatus: "completed",
      payoutMethod: args.payoutMethod,
      payoutDate: Date.now(),
      payoutReference: args.payoutReference,
      payoutNotes: args.payoutNotes,
    });

    console.log(`✅ Payout marqué comme complété: ${args.transactionId}`);
    console.log(`   Montant: $${transaction.providerAmount}`);
    console.log(`   Méthode: ${args.payoutMethod}`);
    console.log(`   Référence: ${args.payoutReference}`);

    return {
      success: true,
      message: "Payout marqué comme complété",
    };
  },
});

// Récupérer l'historique des payouts d'un prestataire
export const getProviderPayouts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_offreur", (q) => q.eq("offreurId", args.userId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    return transactions.map(t => ({
      ...t,
      payoutStatus: t.payoutStatus || "pending",
    }));
  },
});

// Statistiques des payouts
export const getPayoutStats = query({
  handler: async (ctx) => {
    const allTransactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const pending = allTransactions.filter(t => !t.payoutStatus || t.payoutStatus === "pending");
    const completed = allTransactions.filter(t => t.payoutStatus === "completed");

    const pendingAmount = pending.reduce((sum, t) => sum + t.providerAmount, 0);
    const completedAmount = completed.reduce((sum, t) => sum + t.providerAmount, 0);

    return {
      totalTransactions: allTransactions.length,
      pendingPayouts: pending.length,
      completedPayouts: completed.length,
      pendingAmount,
      completedAmount,
      totalAmount: pendingAmount + completedAmount,
    };
  },
});
