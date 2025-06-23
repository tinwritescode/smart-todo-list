import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: "first_task",
    title: "First Task Done",
    description: "Complete your first to-do",
    icon: "🥇",
    category: "milestone",
    condition: { type: "total_completed", target: 1 }
  },
  {
    id: "task_master_10",
    title: "Task Master",
    description: "Complete 10 tasks",
    icon: "⭐",
    category: "milestone",
    condition: { type: "total_completed", target: 10 }
  },
  {
    id: "task_champion_50",
    title: "Task Champion",
    description: "Complete 50 tasks",
    icon: "🏆",
    category: "milestone",
    condition: { type: "total_completed", target: 50 }
  },
  {
    id: "task_legend_100",
    title: "Task Legend",
    description: "Complete 100 tasks",
    icon: "👑",
    category: "milestone",
    condition: { type: "total_completed", target: 100 }
  },
  {
    id: "streak_3",
    title: "Getting Started",
    description: "Complete at least 1 task for 3 days in a row",
    icon: "🔥",
    category: "streak",
    condition: { type: "streak", target: 3 }
  },
  {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Complete at least 1 task for 7 days in a row",
    icon: "📅",
    category: "streak",
    condition: { type: "streak", target: 7 }
  },
  {
    id: "streak_30",
    title: "Consistency Master",
    description: "Complete at least 1 task for 30 days in a row",
    icon: "💎",
    category: "streak",
    condition: { type: "streak", target: 30 }
  },
  {
    id: "beat_the_clock",
    title: "Beat the Clock",
    description: "Complete a task before its due time",
    icon: "⏰",
    category: "special",
    condition: { type: "early_completion", target: 1 }
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Complete a task after 11 PM",
    icon: "🌙",
    category: "special",
    condition: { type: "late_completion", target: 1 }
  },
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Complete a task before 6 AM",
    icon: "🌅",
    category: "special",
    condition: { type: "early_bird", target: 1 }
  },
  {
    id: "productive_day_5",
    title: "Productive Day",
    description: "Complete 5 tasks in a single day",
    icon: "📈",
    category: "daily",
    condition: { type: "daily_tasks", target: 5 }
  },
  {
    id: "productive_day_10",
    title: "Super Productive",
    description: "Complete 10 tasks in a single day",
    icon: "🚀",
    category: "daily",
    condition: { type: "daily_tasks", target: 10 }
  },
  {
    id: "weekend_warrior",
    title: "Weekend Warrior",
    description: "Complete tasks on both Saturday and Sunday",
    icon: "🏖️",
    category: "special",
    condition: { type: "weekend_completion", target: 1 }
  }
];

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return userStats || {
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      maxDailyTasks: 0,
      earlyCompletions: 0,
      lateCompletions: 0,
      earlyBirdCompletions: 0,
      weekendCompletions: 0,
      lastCompletionDate: undefined,
      dailyCompletions: {}
    };
  },
});

export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const userStats = await ctx.runQuery(api.achievements.getUserStats);
    if (!userStats) return [];

    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const achievementMap = new Map(userAchievements.map(a => [a.achievementId, a]));

    return ACHIEVEMENTS.map(achievement => {
      const userAchievement = achievementMap.get(achievement.id);
      const progress = calculateProgress(achievement, userStats);
      
      return {
        ...achievement,
        isUnlocked: userAchievement?.isUnlocked || false,
        unlockedAt: userAchievement?.unlockedAt,
        progress: progress.current,
        maxProgress: progress.max,
        progressPercentage: Math.min(100, Math.round((progress.current / progress.max) * 100))
      };
    });
  },
});

export const getRecentAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const recentAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isUnlocked"), true))
      .order("desc")
      .take(5);

    return recentAchievements.map(ua => {
      const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
      return {
        ...achievement,
        unlockedAt: ua.unlockedAt
      };
    });
  },
});

export const updateStatsOnTaskCompletion = mutation({
  args: {
    taskId: v.id("todos"),
    wasEarlyCompletion: v.optional(v.boolean()),
    completionHour: v.number()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Get or create user stats
    let userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userStats) {
      const statsId = await ctx.db.insert("userStats", {
        userId,
        totalCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        maxDailyTasks: 0,
        earlyCompletions: 0,
        lateCompletions: 0,
        earlyBirdCompletions: 0,
        weekendCompletions: 0,

        dailyCompletions: {}
      });
      userStats = await ctx.db.get(statsId);
    }

    if (!userStats) return;

    // Update daily completions
    const dailyCompletions = { ...userStats.dailyCompletions };
    dailyCompletions[today] = (dailyCompletions[today] || 0) + 1;

    // Calculate streak
    let currentStreak = userStats.currentStreak;
    const lastDate = userStats.lastCompletionDate;
    
    if (!lastDate || lastDate !== today) {
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      }
    }

    // Update stats
    const newStats = {
      totalCompleted: userStats.totalCompleted + 1,
      currentStreak,
      longestStreak: Math.max(userStats.longestStreak, currentStreak),
      maxDailyTasks: Math.max(userStats.maxDailyTasks, dailyCompletions[today]),
      earlyCompletions: userStats.earlyCompletions + (args.wasEarlyCompletion ? 1 : 0),
      lateCompletions: userStats.lateCompletions + (args.completionHour >= 23 ? 1 : 0),
      earlyBirdCompletions: userStats.earlyBirdCompletions + (args.completionHour < 6 ? 1 : 0),
      weekendCompletions: userStats.weekendCompletions + (dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0),
      lastCompletionDate: today,
      dailyCompletions
    };

    await ctx.db.patch(userStats._id, newStats);

    // Check for new achievements
    await ctx.runMutation(api.achievements.checkAndUnlockAchievements, {});
  },
});

export const checkAndUnlockAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const userStats = await ctx.runQuery(api.achievements.getUserStats);
    if (!userStats) return [];

    const existingAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const unlockedIds = new Set(existingAchievements.map(a => a.achievementId));
    const newlyUnlocked = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;

      if (isAchievementUnlocked(achievement, userStats)) {
        await ctx.db.insert("userAchievements", {
          userId,
          achievementId: achievement.id,
          isUnlocked: true,
          unlockedAt: Date.now()
        });
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  },
});

function calculateProgress(achievement: any, userStats: any) {
  const condition = achievement.condition;
  
  switch (condition.type) {
    case "total_completed":
      return { current: userStats.totalCompleted, max: condition.target };
    case "streak":
      return { current: userStats.longestStreak, max: condition.target };
    case "early_completion":
      return { current: userStats.earlyCompletions, max: condition.target };
    case "late_completion":
      return { current: userStats.lateCompletions, max: condition.target };
    case "early_bird":
      return { current: userStats.earlyBirdCompletions, max: condition.target };
    case "daily_tasks":
      return { current: userStats.maxDailyTasks, max: condition.target };
    case "weekend_completion":
      return { current: userStats.weekendCompletions > 0 ? 1 : 0, max: condition.target };
    default:
      return { current: 0, max: 1 };
  }
}

function isAchievementUnlocked(achievement: any, userStats: any): boolean {
  const progress = calculateProgress(achievement, userStats);
  return progress.current >= progress.max;
}
