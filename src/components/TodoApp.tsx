import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DailyResetModal } from "./DailyResetModal";
import { TodoItem } from "./TodoItem";
import { AchievementNotification } from "./AchievementNotification";
import { sendNotification } from "../lib/utils";
import { toast } from "sonner";

interface TodoAppProps {
  currentFilter: string;
  currentSort: string;
}

export function TodoApp({ currentFilter, currentSort }: TodoAppProps) {
  const [showDailyReset, setShowDailyReset] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  const todos = useQuery(api.todos.list, {
    filter: currentFilter as any,
    sortBy: currentSort as any,
  });
  const allTodos = useQuery(api.todos.list, { filter: "all" });
  const pastTasks = useQuery(api.todos.getPastTasks);
  const userSettings = useQuery(api.todos.getUserSettings);

  const toggleTodo = useMutation(api.todos.toggle);
  const snoozeTodo = useMutation(api.todos.snooze);
  const removeTodo = useMutation(api.todos.remove);
  const carryOverTasks = useMutation(api.todos.carryOverTasks);
  const updateUserSettings = useMutation(api.todos.updateUserSettings);
  const updateStats = useMutation(api.achievements.updateStatsOnTaskCompletion);
  const checkAchievements = useMutation(
    api.achievements.checkAndUnlockAchievements
  );

  // Check for daily reset on app load
  useEffect(() => {
    if (pastTasks && pastTasks.length > 0 && userSettings) {
      const today = new Date().toISOString().split("T")[0];
      const shouldShowReset =
        userSettings.lastResetDate !== today && !userSettings.rollOverTasks;

      if (shouldShowReset) {
        setShowDailyReset(true);
      } else if (
        userSettings.rollOverTasks &&
        userSettings.lastResetDate !== today
      ) {
        // Auto carry over if setting is enabled
        carryOverTasks({ taskIds: pastTasks.map((task) => task._id) });
        updateUserSettings({ lastResetDate: today });
      }
    }
  }, [pastTasks, userSettings]);

  const handleToggle = async (id: Id<"todos">) => {
    try {
      const todo = allTodos?.find((t) => t._id === id);
      if (!todo) return;

      await toggleTodo({ id });

      // If completing a task, update stats and check achievements
      if (!todo.isCompleted) {
        const now = new Date();
        const wasEarlyCompletion = todo.dueTime
          ? todo.dueTime > Date.now()
          : false;

        await updateStats({
          taskId: id,
          wasEarlyCompletion,
          completionHour: now.getHours(),
        });

        sendNotification("Task completed!");

        // Check for new achievements
        const newAchievements = await checkAchievements();
        if (newAchievements && newAchievements.length > 0) {
          setNewAchievement(newAchievements[0]);
          sendNotification("New achievement unlocked! 🏆");
        }
      }
    } catch (error) {
      toast.error("Failed to update todo");
    }
  };

  const handleSnooze = async (id: Id<"todos">) => {
    try {
      await snoozeTodo({ id });
      toast.success("Todo snoozed for 30 minutes");
    } catch (error) {
      toast.error("Failed to snooze todo");
    }
  };

  const handleRemove = async (id: Id<"todos">) => {
    try {
      await removeTodo({ id });
      toast.success("Todo deleted");
    } catch (error) {
      toast.error("Failed to delete todo");
    }
  };

  const handleCarryOver = async (taskIds: Id<"todos">[]) => {
    try {
      await carryOverTasks({ taskIds });
      const today = new Date().toISOString().split("T")[0];
      await updateUserSettings({ lastResetDate: today });
      toast.success(
        `Carried over ${taskIds.length} task${taskIds.length !== 1 ? "s" : ""}`
      );
    } catch (error) {
      toast.error("Failed to carry over tasks");
    }
  };

  const handleDailyResetClose = async () => {
    setShowDailyReset(false);
    const today = new Date().toISOString().split("T")[0];
    await updateUserSettings({ lastResetDate: today });
  };

  if (todos === undefined || allTodos === undefined) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />

      {/* Daily Reset Modal */}
      {showDailyReset && pastTasks && (
        <DailyResetModal
          pastTasks={pastTasks}
          onClose={handleDailyResetClose}
          onCarryOver={handleCarryOver}
        />
      )}

      {/* Todo List */}
      {todos.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentFilter === "all" && "All Tasks"}
            {currentFilter === "today" && "Today's Tasks"}
            {currentFilter === "overdue" && "Overdue Tasks"}
            {currentFilter === "completed" && "Completed Tasks"}
            {currentFilter === "unscheduled" && "Unscheduled Tasks"}
            {currentFilter === "past" && "Past Tasks"}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({todos.length})
            </span>
          </h2>
          {todos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={handleToggle}
              onSnooze={handleSnooze}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">
            {currentFilter === "all" && "No todos yet!"}
            {currentFilter === "today" && "No tasks for today!"}
            {currentFilter === "overdue" && "No overdue tasks!"}
            {currentFilter === "completed" && "No completed tasks!"}
            {currentFilter === "unscheduled" && "No unscheduled tasks!"}
            {currentFilter === "past" && "No past tasks!"}
          </p>
          {currentFilter === "all" && (
            <p>Add your first task above to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
