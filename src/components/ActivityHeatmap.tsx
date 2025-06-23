import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";

interface HeatmapCellProps {
  count: number;
  date: string;
}

function HeatmapCell({ count, date }: HeatmapCellProps) {
  // Define color intensity based on count
  let intensity = "bg-gray-100";
  if (count > 0) {
    if (count >= 10) intensity = "bg-green-500";
    else if (count >= 7) intensity = "bg-green-400";
    else if (count >= 4) intensity = "bg-green-300";
    else if (count >= 1) intensity = "bg-green-200";
  }

  return (
    <div
      className={`w-3 h-3 ${intensity} rounded-sm`}
      title={`${count} tasks on ${new Date(date).toLocaleDateString()}`}
    />
  );
}

export function ActivityHeatmap() {
  const userStats = useQuery(api.achievements.getUserStats);

  const heatmapData = useMemo(() => {
    if (!userStats?.dailyCompletions) return [];

    // Get dates for the last 365 days
    const dates = [];
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 364); // 365 days including today

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      dates.push({
        date: dateStr,
        count:
          (userStats.dailyCompletions as Record<string, number>)[dateStr] || 0,
      });
    }

    return dates;
  }, [userStats?.dailyCompletions]);

  if (!userStats) return null;

  // Calculate max contributions for the legend
  const maxCount = Math.max(
    ...Object.values(userStats.dailyCompletions as Record<string, number>)
  );

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Activity Heatmap
      </h2>

      {/* Grid container */}
      <div className="flex flex-wrap gap-1">
        {heatmapData.map((day) => (
          <HeatmapCell key={day.date} count={day.count} date={day.date} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-green-200 rounded-sm" />
          <div className="w-3 h-3 bg-green-300 rounded-sm" />
          <div className="w-3 h-3 bg-green-400 rounded-sm" />
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
