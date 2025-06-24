import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FilterSortControls } from "./FilterSortControls";

interface TodoFiltersProps {
  currentFilter: string;
  currentSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

export function TodoFilters({
  currentFilter,
  currentSort,
  onFilterChange,
  onSortChange,
}: TodoFiltersProps) {
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
