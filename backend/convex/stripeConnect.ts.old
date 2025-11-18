import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 🎭 MODE DEMO - Simuler Stripe Connect
// TODO: Remplacer par les vraies API Stripe en production

// Créer un compte Connect pour un prestataire (DEMO)
export const createConnectAccount = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // 🎭 DEMO: Générer un faux ID de compte Connect
    const fakeAccountId = `acct_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mettre à jour l'utilisateur
    await ctx.db.patch(args.userId, {
      stripeConnectAccountId: fakeAccountId,
      stripeOnboardingComplete: false,
      stripeAccountStatus: "pending",
    });

    console.log(`✅ [DEMO] Compte Connect créé pour ${user.name}: ${fakeAccountId}`);

    return {
      accountId: fakeAccountId,
      message: "🎭 MODE DEMO - Compte Connect simulé créé",
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await ctx.db.patch(args.userId, {
      stripeConnectAccountId: account.id,
      stripeOnboardingComplete: false,
      stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
    });

    return { accountId: account.id };
    */
  },
});

// Générer un lien d'onboarding (DEMO)
export const createAccountLink = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.stripeConnectAccountId) {
      throw new Error("Aucun compte Connect trouvé");
    }

    // 🎭 DEMO: Générer un faux lien d'onboarding
    const fakeLinkUrl = `/stripe-onboarding-demo?account=${user.stripeConnectAccountId}`;

    console.log(`✅ [DEMO] Lien d'onboarding généré pour ${user.name}`);

    return {
      url: fakeLinkUrl,
      message: "🎭 MODE DEMO - Lien d'onboarding simulé",
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: `${process.env.APP_URL}/reauth`,
      return_url: `${process.env.APP_URL}/dashboard`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url };
    */
  },
});

// Compléter l'onboarding (DEMO)
export const completeOnboarding = mutation({
  args: {
    userId: v.id("users"),
    bankAccountLast4: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.stripeConnectAccountId) {
      throw new Error("Aucun compte Connect trouvé");
    }

    // 🎭 DEMO: Simuler la complétion de l'onboarding
    await ctx.db.patch(args.userId, {
      stripeOnboardingComplete: true,
      stripeAccountStatus: "active",
      stripeBankAccountLast4: args.bankAccountLast4 || "4242",
    });

    console.log(`✅ [DEMO] Onboarding complété pour ${user.name}`);

    return {
      success: true,
      message: "🎭 MODE DEMO - Onboarding simulé complété",
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    
    await ctx.db.patch(args.userId, {
      stripeOnboardingComplete: account.details_submitted,
      stripeAccountStatus: account.charges_enabled ? 'active' : 'pending',
    });

    return { success: true };
    */
  },
});

// Vérifier le statut du compte Connect
export const checkAccountStatus = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return {
        hasAccount: false,
        onboardingComplete: false,
        status: "none",
      };
    }

    return {
      hasAccount: !!user.stripeConnectAccountId,
      onboardingComplete: user.stripeOnboardingComplete || false,
      status: user.stripeAccountStatus || "none",
      accountId: user.stripeConnectAccountId,
      bankAccountLast4: user.stripeBankAccountLast4,
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    if (!user.stripeConnectAccountId) {
      return { hasAccount: false, onboardingComplete: false, status: 'none' };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);

    return {
      hasAccount: true,
      onboardingComplete: account.details_submitted,
      status: account.charges_enabled ? 'active' : 'pending',
      accountId: account.id,
    };
    */
  },
});

// Créer un Payment Intent (DEMO)
export const createPaymentIntent = mutation({
  args: {
    amount: v.number(), // en dollars (pas en centimes pour simplifier le demo)
    sessionId: v.id("meetSessions"),
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
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
    */
  },
});

// Transférer l'argent au prestataire (DEMO)
export const transferToProvider = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction non trouvée");
    }

    const prestataire = await ctx.db.get(transaction.offreurId);
    if (!prestataire?.stripeConnectAccountId) {
      throw new Error("Le prestataire n'a pas de compte Connect");
    }

    if (!prestataire.stripeOnboardingComplete) {
      throw new Error("Le prestataire n'a pas complété son onboarding");
    }

    // 🎭 DEMO: Simuler le transfert
    const fakeTransferId = `tr_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stripeFees = (transaction.totalAmount * 0.029) + 0.30; // 2.9% + $0.30

    await ctx.db.patch(args.transactionId, {
      stripeTransferId: fakeTransferId,
      stripeFees: stripeFees,
      status: "completed",
    });

    console.log(`✅ [DEMO] Transfert simulé: $${transaction.providerAmount} → ${prestataire.name}`);
    console.log(`   Frais Stripe: $${stripeFees.toFixed(2)}`);

    return {
      transferId: fakeTransferId,
      amount: transaction.providerAmount,
      fees: stripeFees,
      message: "🎭 MODE DEMO - Transfert simulé vers le prestataire",
    };

    /* 🔌 PRODUCTION CODE (à décommenter):
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    const transfer = await stripe.transfers.create({
      amount: Math.round(transaction.providerAmount * 100), // en centimes
      currency: 'usd',
      destination: prestataire.stripeConnectAccountId,
      metadata: {
        transactionId: args.transactionId,
        sessionId: transaction.sessionId,
      },
    });

    await ctx.db.patch(args.transactionId, {
      stripeTransferId: transfer.id,
      status: 'completed',
    });

    return { transferId: transfer.id };
    */
  },
});
