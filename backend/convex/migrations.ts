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
