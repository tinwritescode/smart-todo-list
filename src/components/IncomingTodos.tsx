import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatDueTime } from "../lib/utils";

export function IncomingTodos() {
  const incomingTodos = useQuery(api.todos.getIncoming);

  if (!incomingTodos || incomingTodos.length === 0) {
    return <div className="text-sm text-gray-500">No upcoming todos</div>;
  }

  return (
    <div>
      <div className="space-y-1">
        {incomingTodos.map((todo) => (
          <div
            key={todo._id}
            className="flex items-center justify-between text-sm bg-blue-50/50 px-3 py-2 rounded-lg"
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
