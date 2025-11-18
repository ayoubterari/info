import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Créer une transaction lors d'un paiement
export const createTransaction = mutation({
  args: {
    sessionId: v.id("meetSessions"),
    offreId: v.id("offres"),
    demandeurId: v.id("users"),
    offreurId: v.id("users"),
    totalAmount: v.number(),
    stripePaymentIntentId: v.optional(v.string()),
    stripePaymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // ✅ VÉRIFIER SI UNE TRANSACTION EXISTE DÉJÀ POUR CETTE SESSION
    const existingTransaction = await ctx.db
      .query("transactions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingTransaction) {
      console.log(`⚠️ Transaction déjà existante pour la session ${args.sessionId}`);
      return {
        transactionId: existingTransaction._id,
        totalAmount: existingTransaction.totalAmount,
        commissionRate: existingTransaction.commissionRate,
        commissionAmount: existingTransaction.commissionAmount,
        providerAmount: existingTransaction.providerAmount,
        stripeFees: existingTransaction.stripeFees,
        alreadyExists: true,
      };
    }

    // Récupérer le taux de commission
    const commissionSetting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "commission_rate"))
      .first();

    const commissionRate = commissionSetting ? Number(commissionSetting.value) : 10;

    // Calculer les montants
    const commissionAmount = (args.totalAmount * commissionRate) / 100;
    const providerAmount = args.totalAmount - commissionAmount;
    
    // Calculer les frais Stripe (2.9% + $0.30)
    const stripeFees = (args.totalAmount * 0.029) + 0.30;

    // Créer la transaction
    const transactionId = await ctx.db.insert("transactions", {
      sessionId: args.sessionId,
      offreId: args.offreId,
      demandeurId: args.demandeurId,
      offreurId: args.offreurId,
      totalAmount: args.totalAmount,
      commissionRate,
      commissionAmount,
      providerAmount,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripePaymentMethod: args.stripePaymentMethod || "demo_card",
      stripeFees,
      status: "completed",
      createdAt: Date.now(),
    });

    console.log(`💰 Transaction créée: ${transactionId}`);
    console.log(`   Total: $${args.totalAmount}`);
    console.log(`   Commission (${commissionRate}%): $${commissionAmount.toFixed(2)}`);
    console.log(`   Frais Stripe: $${stripeFees.toFixed(2)}`);
    console.log(`   Prestataire reçoit: $${providerAmount.toFixed(2)}`);

    // Créditer le wallet du prestataire
    const offreur = await ctx.db.get(args.offreurId);
    if (offreur) {
      const currentBalance = offreur.walletBalance || 0;
      const newBalance = currentBalance + providerAmount;
      
      await ctx.db.patch(args.offreurId, {
        walletBalance: newBalance,
      });

      console.log(`💰 Wallet du prestataire crédité:`);
      console.log(`   ${offreur.name}: $${currentBalance} → $${newBalance} (+$${providerAmount})`);
    }

    return {
      transactionId,
      totalAmount: args.totalAmount,
      commissionRate,
      commissionAmount,
      providerAmount,
      stripeFees,
    };
  },
});

// Récupérer toutes les transactions
export const getAllTransactions = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .order("desc")
      .collect();

    // Enrichir avec les informations utilisateur
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const demandeur = await ctx.db.get(transaction.demandeurId);
        const offreur = await ctx.db.get(transaction.offreurId);
        const session = await ctx.db.get(transaction.sessionId);
        const offre = await ctx.db.get(transaction.offreId);

        return {
          ...transaction,
          demandeurName: demandeur?.name || "Inconnu",
          demandeurEmail: demandeur?.email || "N/A",
          offreurName: offreur?.name || "Inconnu",
          offreurEmail: offreur?.email || "N/A",
          sessionStatus: session?.status || "unknown",
        };
      })
    );

    return enrichedTransactions;
  },
});

// Récupérer les transactions d'un utilisateur (en tant que demandeur)
export const getUserTransactionsAsDemandeur = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_demandeur", (q) => q.eq("demandeurId", args.userId))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Récupérer les transactions d'un utilisateur (en tant que prestataire)
export const getUserTransactionsAsOffreur = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_offreur", (q) => q.eq("offreurId", args.userId))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Calculer les statistiques de commission
export const getCommissionStats = query({
  handler: async (ctx) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalCommissions = transactions.reduce(
      (sum, t) => sum + t.commissionAmount,
      0
    );
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalProviderEarnings = transactions.reduce(
      (sum, t) => sum + t.providerAmount,
      0
    );

    return {
      totalTransactions: transactions.length,
      totalRevenue,
      totalCommissions,
      totalProviderEarnings,
      averageCommissionRate:
        transactions.length > 0
          ? transactions.reduce((sum, t) => sum + t.commissionRate, 0) /
            transactions.length
          : 0,
    };
  },
});
