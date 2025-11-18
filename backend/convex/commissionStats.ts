import { query } from "./_generated/server";

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
