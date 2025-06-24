import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { parseNaturalLanguage } from "../utils/naturalLanguageParser";
import { toast } from "sonner";

function sendNotification(message: string) {
  window.postMessage({ type: "notification", message }, "*");
  toast.success(message);
}

export function TodoForm() {
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
