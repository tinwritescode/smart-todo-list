import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  todos: defineTable({
    userId: v.id("users"),
    text: v.string(),
    dueTime: v.optional(v.number()),
    isCompleted: v.boolean(),
    isOverdue: v.boolean(),
    createdDate: v.optional(v.string()), // YYYY-MM-DD format for daily reset
    order: v.optional(v.number()), // For manual ordering
  })
    .index("by_user", ["userId"])
    .index("by_user_and_due_time", ["userId", "dueTime"])
    .index("by_user_and_completed", ["userId", "isCompleted"])
    .index("by_user_and_date", ["userId", "createdDate"]),

  userSettings: defineTable({
    userId: v.id("users"),
    rollOverTasks: v.boolean(),
    lastResetDate: v.string(), // YYYY-MM-DD format
    lastActiveTime: v.number(), // Timestamp of last activity
  }).index("by_user", ["userId"]),

  userStats: defineTable({
    userId: v.id("users"),
    totalCompleted: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    maxDailyTasks: v.number(),
    earlyCompletions: v.number(),
    lateCompletions: v.number(),
    earlyBirdCompletions: v.number(),
    weekendCompletions: v.number(),
    lastCompletionDate: v.optional(v.string()),
    dailyCompletions: v.record(v.string(), v.number()), // date -> count
  }).index("by_user", ["userId"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    isUnlocked: v.boolean(),
    unlockedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_achievement", ["userId", "achievementId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
