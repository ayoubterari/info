import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Créer une nouvelle notification
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("new_offre"),
      v.literal("offre_accepted"),
      v.literal("offre_rejected"),
      v.literal("payment_received"),
      v.literal("demande_completed")
    ),
    title: v.string(),
    message: v.string(),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      relatedId: args.relatedId,
      relatedType: args.relatedType,
      read: false,
      createdAt: Date.now(),
    });

    return notificationId;
  },
});

// Récupérer toutes les notifications d'un utilisateur
export const getUserNotifications = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Récupérer les notifications non lues d'un utilisateur
export const getUnreadNotifications = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId!).eq("read", false)
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

// Compter les notifications non lues
export const countUnreadNotifications = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return 0;
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId!).eq("read", false)
      )
      .collect();

    return notifications.length;
  },
});

// Marquer une notification comme lue
export const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return { success: true };
  },
});

// Marquer toutes les notifications d'un utilisateur comme lues
export const markAllNotificationsAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", false)
      )
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return { success: true, count: notifications.length };
  },
});

// Supprimer une notification
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// Supprimer toutes les notifications lues d'un utilisateur
export const deleteReadNotifications = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", args.userId).eq("read", true)
      )
      .collect();

    await Promise.all(
      notifications.map((notification) =>
        ctx.db.delete(notification._id)
      )
    );

    return { success: true, count: notifications.length };
  },
});
