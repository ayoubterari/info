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
