import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Récupérer le wallet d'un utilisateur
export const getUserWallet = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return {
      balance: user.walletBalance || 0,
      bankAccountInfo: user.bankAccountInfo,
    };
  },
});

// Mettre à jour les informations bancaires
export const updateBankAccountInfo = mutation({
  args: {
    userId: v.id("users"),
    bankAccountInfo: v.object({
      accountHolderName: v.string(),
      bankName: v.string(),
      accountNumber: v.string(),
      routingNumber: v.optional(v.string()),
      iban: v.optional(v.string()),
      swift: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      bankAccountInfo: args.bankAccountInfo,
    });

    console.log(`✅ Informations bancaires mises à jour pour l'utilisateur ${args.userId}`);

    return { success: true };
  },
});

// Créditer le wallet (appelé après une transaction)
export const creditWallet = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + args.amount;

    await ctx.db.patch(args.userId, {
      walletBalance: newBalance,
    });

    console.log(`💰 Wallet crédité: +$${args.amount} pour ${user.name}`);
    console.log(`   Ancien solde: $${currentBalance}`);
    console.log(`   Nouveau solde: $${newBalance}`);

    return {
      success: true,
      previousBalance: currentBalance,
      newBalance,
      amountAdded: args.amount,
    };
  },
});

// Débiter le wallet (lors d'une demande de payout)
export const debitWallet = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    const currentBalance = user.walletBalance || 0;

    if (currentBalance < args.amount) {
      throw new Error(`Solde insuffisant. Disponible: $${currentBalance}, Demandé: $${args.amount}`);
    }

    const newBalance = currentBalance - args.amount;

    await ctx.db.patch(args.userId, {
      walletBalance: newBalance,
    });

    console.log(`💸 Wallet débité: -$${args.amount} pour ${user.name}`);
    console.log(`   Ancien solde: $${currentBalance}`);
    console.log(`   Nouveau solde: $${newBalance}`);

    return {
      success: true,
      previousBalance: currentBalance,
      newBalance,
      amountDeducted: args.amount,
    };
  },
});

// Créer une demande de payout
export const createPayoutRequest = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier que l'utilisateur a des informations bancaires
    if (!user.bankAccountInfo) {
      throw new Error("Veuillez d'abord ajouter vos informations bancaires");
    }

    // Vérifier le solde
    const currentBalance = user.walletBalance || 0;
    if (currentBalance < args.amount) {
      throw new Error(`Solde insuffisant. Disponible: $${currentBalance}`);
    }

    // Montant minimum de payout
    const MIN_PAYOUT = 10;
    if (args.amount < MIN_PAYOUT) {
      throw new Error(`Le montant minimum de retrait est de $${MIN_PAYOUT}`);
    }

    // Débiter le wallet
    const newBalance = currentBalance - args.amount;

    await ctx.db.patch(args.userId, {
      walletBalance: newBalance,
    });

    // Créer la demande de payout
    const payoutRequestId = await ctx.db.insert("payoutRequests", {
      userId: args.userId,
      amount: args.amount,
      status: "pending",
      bankAccountInfo: user.bankAccountInfo,
      createdAt: Date.now(),
    });

    console.log(`📤 Demande de payout créée: ${payoutRequestId}`);
    console.log(`   Utilisateur: ${user.name}`);
    console.log(`   Montant: $${args.amount}`);

    return {
      payoutRequestId,
      amount: args.amount,
      status: "pending",
    };
  },
});

// Récupérer les demandes de payout d'un utilisateur
export const getUserPayoutRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("payoutRequests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return requests;
  },
});

// Récupérer toutes les demandes de payout (admin)
export const getAllPayoutRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    let requests;

    if (args.status) {
      requests = await ctx.db
        .query("payoutRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    } else {
      requests = await ctx.db
        .query("payoutRequests")
        .order("desc")
        .collect();
    }

    // Enrichir avec les informations utilisateur
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const user = await ctx.db.get(request.userId);
        return {
          ...request,
          userName: user?.name || "Inconnu",
          userEmail: user?.email || "N/A",
        };
      })
    );

    return enrichedRequests;
  },
});

// Traiter une demande de payout (admin)
export const processPayoutRequest = mutation({
  args: {
    payoutRequestId: v.id("payoutRequests"),
    adminId: v.id("users"),
    status: v.union(v.literal("completed"), v.literal("rejected")),
    payoutMethod: v.optional(v.string()),
    payoutReference: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.payoutRequestId);
    if (!request) {
      throw new Error("Demande de payout non trouvée");
    }

    if (request.status !== "pending" && request.status !== "processing") {
      throw new Error("Cette demande a déjà été traitée");
    }

    // Si rejeté, recréditer le wallet
    if (args.status === "rejected") {
      const user = await ctx.db.get(request.userId);
      if (user) {
        const currentBalance = user.walletBalance || 0;
        await ctx.db.patch(request.userId, {
          walletBalance: currentBalance + request.amount,
        });
      }

      console.log(`❌ Demande de payout rejetée: ${args.payoutRequestId}`);
      console.log(`   Montant recrédité: $${request.amount}`);
    } else {
      console.log(`✅ Demande de payout approuvée: ${args.payoutRequestId}`);
      console.log(`   Montant: $${request.amount}`);
      console.log(`   Référence: ${args.payoutReference}`);
    }

    // Mettre à jour la demande
    await ctx.db.patch(args.payoutRequestId, {
      status: args.status,
      processedBy: args.adminId,
      processedAt: Date.now(),
      payoutMethod: args.payoutMethod,
      payoutReference: args.payoutReference,
      adminNotes: args.adminNotes,
      rejectionReason: args.rejectionReason,
    });

    return { success: true };
  },
});

// Statistiques du wallet (admin)
export const getWalletStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const payoutRequests = await ctx.db.query("payoutRequests").collect();

    const totalWalletBalance = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
    const pendingPayouts = payoutRequests.filter(r => r.status === "pending");
    const completedPayouts = payoutRequests.filter(r => r.status === "completed");

    const pendingAmount = pendingPayouts.reduce((sum, r) => sum + r.amount, 0);
    const completedAmount = completedPayouts.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalWalletBalance,
      pendingPayouts: pendingPayouts.length,
      completedPayouts: completedPayouts.length,
      pendingAmount,
      completedAmount,
      totalPayoutRequests: payoutRequests.length,
    };
  },
});
