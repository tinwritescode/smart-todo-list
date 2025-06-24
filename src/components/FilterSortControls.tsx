interface FilterSortControlsProps {
  currentFilter: string;
  currentSort: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
  taskCounts: {
    all: number;
    today: number;
    overdue: number;
    completed: number;
    unscheduled: number;
    past: number;
  };
}

export function FilterSortControls({
  currentFilter,
  currentSort,
  onFilterChange,
  onSortChange,
  taskCounts,
}: FilterSortControlsProps) {
  const filters = [
    { key: "all", label: "All Tasks", count: taskCounts.all },
    { key: "today", label: "Today", count: taskCounts.today },
    { key: "overdue", label: "Overdue", count: taskCounts.overdue },
    { key: "completed", label: "Completed", count: taskCounts.completed },
    { key: "unscheduled", label: "Unscheduled", count: taskCounts.unscheduled },
    { key: "past", label: "Past Tasks", count: taskCounts.past },
  ];

  const sorts = [
    { key: "dueTime", label: "Due Time" },
    { key: "createdTime", label: "Created" },
    { key: "manual", label: "Manual" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Controls */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Tasks
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  currentFilter === filter.key
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                      currentFilter === filter.key
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Controls */}
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {sorts.map((sort) => (
              <option key={sort.key} value={sort.key}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
