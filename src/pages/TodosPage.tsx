import { useState } from "react";
import { TodoForm } from "@/components/TodoForm";
import { TodoFilters } from "@/components/TodoFilters";
import { TodoApp } from "@/components/TodoApp";
import { IncomingTodos } from "@/components/IncomingTodos";
import { IncomingCount } from "@/components/IncomingCount";
import { Button } from "@radix-ui/themes";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TodosPage() {
  const [showIncoming, setShowIncoming] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSort, setCurrentSort] = useState("dueTime");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Todos</h1>
        <p className="text-gray-600">
          Stay organized with smart due-time handling and natural language input
        </p>
      </div>

      <div className="md:hidden">
        <Button
          onClick={() => setShowIncoming(!showIncoming)}
          variant="ghost"
          className="w-full justify-start hover:bg-gray-100"
        >
          <div className="flex items-center gap-2 flex-1">
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                showIncoming && "rotate-180"
              )}
            />
            <span>Incoming Tasks</span>
            <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">
              <IncomingCount />
            </div>
          </div>
        </Button>
        <div
          className={cn(showIncoming ? "block" : "hidden", "pl-6 space-y-2")}
        >
          <IncomingTodos />
        </div>
      </div>

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
          <TodoApp currentFilter={currentFilter} currentSort={currentSort} />
        </div>
      </div>
    </div>
  );
}
