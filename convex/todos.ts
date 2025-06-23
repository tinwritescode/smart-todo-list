import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

export const list = query({
  args: {
    filter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("today"),
        v.literal("overdue"),
        v.literal("completed"),
        v.literal("unscheduled"),
        v.literal("past")
      )
    ),
    sortBy: v.optional(
      v.union(
        v.literal("dueTime"),
        v.literal("createdTime"),
        v.literal("manual")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const filter = args.filter || "all";
    const sortBy = args.sortBy || "dueTime";
    const today = getTodayString();

    let todos = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate overdue status on the fly
    const now = Date.now();
    todos = todos.map((todo) => ({
      ...todo,
      isOverdue: !todo.isCompleted && !!todo.dueTime && todo.dueTime < now,
    }));

    // Apply filters
    switch (filter) {
      case "today":
        todos = todos.filter(
          (todo) =>
            todo.createdDate === today ||
            (todo.dueTime &&
              new Date(todo.dueTime).toISOString().split("T")[0] === today) ||
            !todo.createdDate
        ); // Include legacy todos without createdDate
        break;
      case "overdue":
        todos = todos.filter((todo) => todo.isOverdue);
        break;
      case "completed":
        todos = todos.filter((todo) => todo.isCompleted);
        break;
      case "unscheduled":
        todos = todos.filter((todo) => !todo.dueTime);
        break;
      case "past":
        todos = todos.filter(
          (todo) =>
            todo.createdDate && todo.createdDate < today && !todo.isCompleted
        );
        break;
      case "all":
      default:
        // Show all except past incomplete tasks unless specifically requested
        todos = todos.filter(
          (todo) =>
            !todo.createdDate ||
            todo.createdDate === today ||
            todo.isCompleted ||
            todo.dueTime
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "createdTime":
        todos.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case "manual":
        todos.sort((a, b) => (a.order || 0) - (b.order || 0));
        break;
      case "dueTime":
      default:
        todos.sort((a, b) => {
          if (!a.dueTime && !b.dueTime)
            return a._creationTime - b._creationTime;
          if (!a.dueTime) return 1;
          if (!b.dueTime) return -1;
          return a.dueTime - b.dueTime;
        });
        break;
    }

    return todos;
  },
});

export const getIncoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const now = Date.now();
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_user_and_completed", (q) =>
        q.eq("userId", userId).eq("isCompleted", false)
      )
      .filter((q) => q.gte(q.field("dueTime"), now))
      .order("asc")
      .take(3);

    return todos;
  },
});

export const getPastTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const today = getTodayString();
    const pastTasks = await ctx.db
      .query("todos")
      .withIndex("by_user_and_completed", (q) =>
        q.eq("userId", userId).eq("isCompleted", false)
      )
      .filter((q) => q.neq(q.field("createdDate"), undefined))
      .filter((q) => q.lt(q.field("createdDate"), today))
      .collect();

    return pastTasks;
  },
});

export const create = mutation({
  args: {
    text: v.string(),
    dueTime: v.optional(v.number()),
    parsedText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const today = getTodayString();
    const taskText = args.parsedText || args.text;

    return await ctx.db.insert("todos", {
      userId,
      text: taskText,
      dueTime: args.dueTime,
      isCompleted: false,
      isOverdue: false,
      createdDate: today,
      order: Date.now(), // Use timestamp as default order
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      isCompleted: !todo.isCompleted,
      isOverdue: false, // Reset overdue when completing
    });
  },
});

export const snooze = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    if (!todo.dueTime) {
      throw new Error("Cannot snooze task without due time");
    }

    const newDueTime = todo.dueTime + 30 * 60 * 1000; // Add 30 minutes
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Don't snooze beyond end of day
    const finalDueTime = Math.min(newDueTime, endOfDay.getTime());

    await ctx.db.patch(args.id, {
      dueTime: finalDueTime,
      isOverdue: false, // Reset overdue when snoozing
    });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const carryOverTasks = mutation({
  args: { taskIds: v.array(v.id("todos")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const today = getTodayString();

    for (const taskId of args.taskIds) {
      const todo = await ctx.db.get(taskId);
      if (todo && todo.userId === userId) {
        await ctx.db.patch(taskId, {
          createdDate: today,
        });
      }
    }
  },
});

// User Settings
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return (
      settings || {
        rollOverTasks: false,
        lastResetDate: getTodayString(),
      }
    );
  },
});

export const updateUserSettings = mutation({
  args: {
    rollOverTasks: v.optional(v.boolean()),
    lastResetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        ...(args.rollOverTasks !== undefined && {
          rollOverTasks: args.rollOverTasks,
        }),
        ...(args.lastResetDate && { lastResetDate: args.lastResetDate }),
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        rollOverTasks: args.rollOverTasks || false,
        lastResetDate: args.lastResetDate || getTodayString(),
      });
    }
  },
});

export const updateText = mutation({
  args: {
    id: v.id("todos"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found");
    }

    await ctx.db.patch(args.id, {
      text: args.text,
    });
  },
});
