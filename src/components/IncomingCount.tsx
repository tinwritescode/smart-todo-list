import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function IncomingCount() {
  const incomingTodos = useQuery(api.todos.getIncoming);

  if (!incomingTodos || incomingTodos.length === 0) return null;

  return <span>{incomingTodos.length}</span>;
}
