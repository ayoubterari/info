import { mutation } from "./_generated/server";

// Migration: Initialiser les compteurs pour les utilisateurs existants
export const initializeUserQuestions = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let updated = 0;
    for (const user of users) {
      if (user.questionsAsked === undefined || user.questionsLimit === undefined) {
        await ctx.db.patch(user._id, {
          questionsAsked: user.questionsAsked || 0,
          questionsLimit: user.questionsLimit || 2,
        });
        updated++;
      }
    }
    
    return { 
      message: `Migration terminée: ${updated} utilisateurs mis à jour sur ${users.length}`,
      updated,
      total: users.length,
    };
  },
});

// Migration: Supprimer les anciens champs Stripe Connect
export const removeStripeConnectFields = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let updated = 0;
    for (const user of users) {
      // Vérifier si l'utilisateur a des anciens champs Stripe Connect
      if (
        user.stripeConnectAccountId !== undefined ||
        user.stripeOnboardingComplete !== undefined ||
        user.stripeBankAccountLast4 !== undefined ||
        user.stripeAccountStatus !== undefined
      ) {
        // Créer un objet de mise à jour qui supprime ces champs
        const updates: any = {
          stripeConnectAccountId: undefined,
          stripeOnboardingComplete: undefined,
          stripeBankAccountLast4: undefined,
          stripeAccountStatus: undefined,
        };
        
        await ctx.db.patch(user._id, updates);
        updated++;
        
        console.log(`✅ Nettoyé les champs Stripe Connect pour: ${user.name}`);
      }
    }
    
    return { 
      message: `Migration terminée: ${updated} utilisateurs nettoyés sur ${users.length}`,
      updated,
      total: users.length,
    };
  },
});

// Migration: Supprimer les transactions en double
export const removeDuplicateTransactions = mutation({
  args: {},
  handler: async (ctx) => {
    const transactions = await ctx.db.query("transactions").collect();
    
    // Grouper les transactions par sessionId
    const transactionsBySession = new Map<string, any[]>();
    
    for (const transaction of transactions) {
      const sessionId = transaction.sessionId;
      if (!transactionsBySession.has(sessionId)) {
        transactionsBySession.set(sessionId, []);
      }
      transactionsBySession.get(sessionId)!.push(transaction);
    }
    
    let deleted = 0;
    
    // Pour chaque session avec des doublons
    for (const [sessionId, sessionTransactions] of transactionsBySession) {
      if (sessionTransactions.length > 1) {
        // Garder la plus ancienne transaction (première créée)
        const sortedTransactions = sessionTransactions.sort((a, b) => a.createdAt - b.createdAt);
        const toKeep = sortedTransactions[0];
        const toDelete = sortedTransactions.slice(1);
        
        console.log(`🔍 Session ${sessionId}: ${sessionTransactions.length} transactions trouvées`);
        console.log(`   ✅ Garder: ${toKeep._id} (créée à ${new Date(toKeep.createdAt).toISOString()})`);
        
        // Supprimer les doublons
        for (const duplicate of toDelete) {
          await ctx.db.delete(duplicate._id);
          deleted++;
          console.log(`   ❌ Supprimer: ${duplicate._id} (créée à ${new Date(duplicate.createdAt).toISOString()})`);
        }
      }
    }
    
    return {
      message: `Migration terminée: ${deleted} transactions en double supprimées`,
      deleted,
      totalTransactions: transactions.length,
      sessionsWithDuplicates: Array.from(transactionsBySession.entries())
        .filter(([_, txs]) => txs.length > 1).length,
    };
  },
});
