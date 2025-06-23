import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";
import { parseNaturalLanguage } from "./utils/naturalLanguageParser";
import { DailyResetModal } from "./components/DailyResetModal";
import { FilterSortControls } from "./components/FilterSortControls";
import { AchievementsPage } from "./components/AchievementsPage";
import { AchievementNotification } from "./components/AchievementNotification";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"todos" | "achievements">(
    "todos"
  );
  const [showIncoming, setShowIncoming] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center justify-between">
              <a href="/">
                <h2 className="text-xl font-semibold text-gray-800">
                  Smart Todo
                </h2>
              </a>
              <div className="sm:hidden">
                <SignOutButton />
              </div>
            </div>
            <div className="flex items-center justify-between flex-1">
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentPage("todos")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === "todos"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setCurrentPage("achievements")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === "achievements"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  🏆 Achievements
                </button>
              </nav>
              <div className="hidden sm:block">
                <SignOutButton />
              </div>
            </div>
          </div>
          <Authenticated>
            {currentPage === "todos" && (
              <div className="mt-3">
                <button
                  onClick={() => setShowIncoming(!showIncoming)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 w-full"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <svg
                      className={`w-4 h-4 transition-transform ${showIncoming ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span>Incoming Tasks</span>
                  </div>
                  <IncomingCount />
                </button>
                <div className={`${showIncoming ? "block" : "hidden"} mt-2`}>
                  <IncomingTodos />
                </div>
              </div>
            )}
          </Authenticated>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <Content currentPage={currentPage} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function IncomingTodos() {
  const incomingTodos = useQuery(api.todos.getIncoming);

  if (!incomingTodos || incomingTodos.length === 0) {
    return <div className="text-sm text-gray-500">No upcoming todos</div>;
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-600 mb-2">Incoming Todos</h3>
      <div className="space-y-1">
        {incomingTodos.map((todo) => (
          <div
            key={todo._id}
            className="flex items-center justify-between text-sm bg-blue-50 px-3 py-2 rounded"
          >
            <span className="truncate flex-1 mr-2">{todo.text}</span>
            <span className="text-blue-600 font-medium whitespace-nowrap">
              {todo.dueTime ? formatDueTime(todo.dueTime) : "No due time"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomingCount() {
  const incomingTodos = useQuery(api.todos.getIncoming);

  if (!incomingTodos || incomingTodos.length === 0) return null;

  return (
    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
      {incomingTodos.length}
    </span>
  );
}

function Content({ currentPage }: { currentPage: "todos" | "achievements" }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("dueTime");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Authenticated>
          {currentPage === "todos" ? (
            <>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Todos
              </h1>
              <p className="text-gray-600">
                Stay organized with smart due-time handling and natural language
                input
              </p>
            </>
          ) : (
            <AchievementsPage />
          )}
        </Authenticated>
        <Unauthenticated>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Smart Todo List
          </h1>
          <p className="text-gray-600 mb-6">Sign in to manage your tasks</p>
          <SignInForm />
        </Unauthenticated>
      </div>

      <Authenticated>
        {currentPage === "todos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <TodoForm />
              <TodoFilters
                currentFilter={currentFilter}
                currentSort={currentSort}
                onFilterChange={setCurrentFilter}
                onSortChange={setCurrentSort}
              />
            </div>
            <div className="lg:col-span-8">
              <TodoApp
                currentFilter={currentFilter}
                currentSort={currentSort}
              />
            </div>
          </div>
        )}
      </Authenticated>
    </div>
  );
}

function sendNotification(message: string) {
  window.postMessage({ type: "notification", message }, "*");
  toast.success(message);
}

function TodoForm() {
  const [newTodoText, setNewTodoText] = useState("");
  const createTodo = useMutation(api.todos.create);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const parsed = parseNaturalLanguage(newTodoText);
      await createTodo({
        text: newTodoText,
        dueTime: parsed.dueTime,
        parsedText: parsed.text,
      });
      setNewTodoText("");
      sendNotification("Todo created!");
    } catch (error) {
      toast.error("Failed to create todo");
    }
  };

  return (
    <form
      onSubmit={handleCreateTodo}
      className="bg-white p-4 rounded-lg shadow-sm border"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Add with Natural Language
          </label>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Try: 'Submit report at 3pm' or 'Buy groceries tomorrow at 7pm'"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Examples: "Call mom in 1 hour", "Meeting next Tuesday at 2:30pm",
            "Buy groceries tomorrow"
          </p>
        </div>
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Add Todo
        </button>
      </div>
    </form>
  );
}

function TodoFilters({
  currentFilter,
  currentSort,
  onFilterChange,
  onSortChange,
}: {
  currentFilter: string;
  currentSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}) {
  const allTodos = useQuery(api.todos.list, { filter: "all" });

  if (!allTodos) return null;

  // Calculate task counts for filter badges
  const taskCounts = {
    all: allTodos.length,
    today: allTodos.filter((t) => {
      const today = new Date().toISOString().split("T")[0];
      return (
        t.createdDate === today ||
        (t.dueTime &&
          new Date(t.dueTime).toISOString().split("T")[0] === today) ||
        !t.createdDate
      );
    }).length,
    overdue: allTodos.filter(
      (t) => !t.isCompleted && t.dueTime && t.dueTime < Date.now()
    ).length,
    completed: allTodos.filter((t) => t.isCompleted).length,
    unscheduled: allTodos.filter((t) => !t.dueTime).length,
    past: allTodos.filter((t) => {
      const today = new Date().toISOString().split("T")[0];
      return t.createdDate && t.createdDate < today && !t.isCompleted;
    }).length,
  };

  return (
    <FilterSortControls
      currentFilter={currentFilter}
      currentSort={currentSort}
      onFilterChange={onFilterChange}
      onSortChange={onSortChange}
      taskCounts={taskCounts}
    />
  );
}

function TodoApp({
  currentFilter,
  currentSort,
}: {
  currentFilter: string;
  currentSort: string;
}) {
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
  const updateSettings = useMutation(api.todos.updateUserSettings);
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
        updateSettings({ lastResetDate: today });
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
      await updateSettings({ lastResetDate: today });
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
    await updateSettings({ lastResetDate: today });
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

interface TodoItemProps {
  todo: {
    _id: Id<"todos">;
    text: string;
    dueTime?: number;
    isCompleted: boolean;
    isOverdue: boolean;
    createdDate?: string;
  };
  onToggle: (id: Id<"todos">) => void;
  onSnooze: (id: Id<"todos">) => void;
  onRemove: (id: Id<"todos">) => void;
}

function TodoItem({ todo, onToggle, onSnooze, onRemove }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const updateTodoText = useMutation(api.todos.updateText);

  const canSnooze =
    !todo.isCompleted && todo.dueTime && !isEndOfDay(todo.dueTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() === "") return;
    try {
      await updateTodoText({ id: todo._id, text: editText.trim() });
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update todo");
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg border ${
        todo.isOverdue && !todo.isCompleted
          ? "border-red-200 bg-red-50"
          : todo.isCompleted
            ? "border-green-200 bg-green-50"
            : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo._id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
            todo.isCompleted
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-500"
          }`}
        >
          {todo.isCompleted && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onBlur={handleSubmit}
              />
            </form>
          ) : (
            <p
              onClick={() => !todo.isCompleted && setIsEditing(true)}
              className={`${todo.isCompleted ? "line-through text-gray-500" : "text-gray-800 cursor-pointer"}`}
            >
              {todo.text}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {todo.dueTime ? (
              <span
                className={`text-sm ${
                  todo.isOverdue && !todo.isCompleted
                    ? "text-red-600 font-medium"
                    : todo.isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                }`}
              >
                {todo.isOverdue && !todo.isCompleted && "⚠️ "}
                Due: {formatDueTime(todo.dueTime)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No due time</span>
            )}
            {todo.createdDate && (
              <span className="text-xs text-gray-400">
                Created: {new Date(todo.createdDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canSnooze && (
            <button
              onClick={() => onSnooze(todo._id)}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
            >
              Snooze
            </button>
          )}
          {(todo.isCompleted || todo.isOverdue) && (
            <button
              onClick={() => onRemove(todo._id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDueTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const todoDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (todoDate.getTime() === today.getTime()) {
    return `Today ${timeString}`;
  } else if (todoDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow ${timeString}`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function isEndOfDay(timestamp: number): boolean {
  const date = new Date(timestamp);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return Math.abs(date.getTime() - endOfDay.getTime()) < 30 * 60 * 1000; // Within 30 minutes of end of day
}
