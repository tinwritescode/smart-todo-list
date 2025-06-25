import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DueTimeModal } from "./DueTimeModal";
import { SnoozeMenu } from "./SnoozeMenu";
import { formatDueTime, isEndOfDay, sendNotification } from "../lib/utils";
import { toast } from "sonner";

interface TodoItemProps {
  todo: {
    _id: Id<"todos">;
    text: string;
    dueTime?: number;
    isCompleted: boolean;
    isOverdue: boolean;
    createdDate?: string;
    completedAt?: number;
  };
  onToggle: (id: Id<"todos">) => void;
  onSnooze: (id: Id<"todos">) => void;
  onRemove: (id: Id<"todos">) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onSnooze,
  onRemove,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showDueTimeModal, setShowDueTimeModal] = useState(false);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const updateTodoText = useMutation(api.todos.updateText);
  const updateDueTime = useMutation(api.todos.updateDueTime);

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

  const handleDueTimeUpdate = async (newDueTime: number) => {
    try {
      await updateDueTime({ id: todo._id, dueTime: newDueTime });
      sendNotification("Due time updated!");
    } catch (error) {
      toast.error("Failed to update due time");
    }
  };

  const handleSnoozeWithDuration = async (minutes: number) => {
    try {
      const newDueTime = Date.now() + minutes * 60 * 1000;
      await updateDueTime({ id: todo._id, dueTime: newDueTime });
      sendNotification(`Task snoozed for ${minutes} minutes`);
    } catch (error) {
      toast.error("Failed to snooze todo");
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
            <button
              onClick={() => setShowDueTimeModal(true)}
              className={`text-sm ${
                todo.isOverdue && !todo.isCompleted
                  ? "text-red-600 font-medium"
                  : todo.isCompleted
                    ? "text-green-600"
                    : "text-gray-500"
              } hover:underline cursor-pointer`}
            >
              {todo.isOverdue && !todo.isCompleted && "⚠️ "}
              Due: {todo.dueTime ? formatDueTime(todo.dueTime) : "No due time"}
            </button>
            {todo.createdDate && (
              <span className="text-xs text-gray-400">
                Created: {new Date(todo.createdDate).toLocaleDateString()}
              </span>
            )}
            {todo.completedAt && (
              <span className="text-xs text-gray-400">
                Completed: {new Date(todo.completedAt).toLocaleString()}
                {todo.dueTime && (
                  <span className="ml-1">
                    ({todo.completedAt <= todo.dueTime ? "on time" : "late"})
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 relative">
          {canSnooze && (
            <div className="relative">
              <button
                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                Snooze
              </button>
              {showSnoozeMenu && (
                <SnoozeMenu
                  onSnooze={handleSnoozeWithDuration}
                  onClose={() => setShowSnoozeMenu(false)}
                />
              )}
            </div>
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

      {showDueTimeModal && (
        <DueTimeModal
          isOpen={showDueTimeModal}
          onClose={() => setShowDueTimeModal(false)}
          onUpdate={handleDueTimeUpdate}
          currentDueTime={todo.dueTime}
        />
      )}
    </div>
  );
}
