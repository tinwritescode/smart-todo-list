import { internalAction, query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Query to list notifications
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

// Mutation to mark notification as read
export const markAsRead = mutation({
  args: {
    id: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.id, {
      isRead: true,
    });
  },
});

// Action to send notifications
export const sendHourlyNotifications = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Get all users with pending tasks
    const users = await ctx.runQuery(
      internal.todos.getUsersWithPendingTasks,
      {}
    );

    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    const now = Date.now();

    // Send notifications to each user
    for (const user of users) {
      // Get user settings to check last activity
      const settings = await ctx.runQuery(internal.todos.getUserSettingsById, {
        userId: user.userId,
      });

      // Skip if user has been inactive for more than 3 days
      if (
        settings?.lastActiveTime &&
        now - settings.lastActiveTime > THREE_DAYS
      ) {
        continue;
      }

      await ctx.runMutation(internal.todos.addNotification, {
        userId: user.userId,
        message: `You have ${user.pendingCount} pending tasks. Stay productive!`,
      });
    }
    return null;
  },
});
