import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { Button } from "@radix-ui/themes";

export function AchievementsPage() {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const userStats = useQuery(api.achievements.getUserStats, {});
  const achievements = useQuery(api.achievements.getUserAchievements);
  const recentAchievements = useQuery(api.achievements.getRecentAchievements);

  if (userStats === undefined || achievements === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          No Stats Yet
        </h2>
        <p className="text-gray-600">
          Complete your first task to start earning achievements!
        </p>
      </div>
    );
  }

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.isUnlocked;
    if (filter === "locked") return !achievement.isUnlocked;
    return true;
  });

  const categories = {
    milestone: filteredAchievements.filter((a) => a.category === "milestone"),
    streak: filteredAchievements.filter((a) => a.category === "streak"),
    daily: filteredAchievements.filter((a) => a.category === "daily"),
    special: filteredAchievements.filter((a) => a.category === "special"),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏆 Achievements
        </h1>
        <p className="text-gray-600">Your productivity milestones and stats</p>
      </div>

      {/* Stats Summary */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {userStats.totalCompleted}
            </div>
            <div className="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {userStats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {userStats.longestStreak}
            </div>
            <div className="text-sm text-gray-600">Longest Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {userStats.maxDailyTasks}
            </div>
            <div className="text-sm text-gray-600">Best Single Day</div>
          </div>
        </div>
        {userStats.currentStreak > 0 && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-medium">
              🔥 You're on fire! Keep the streak going!
            </p>
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Recent Achievements */}
      {recentAchievements && recentAchievements.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Achievements
          </h2>
          <div className="flex flex-wrap gap-3">
            {recentAchievements
              .filter((a): a is NonNullable<typeof a> => a !== null)
              .map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg"
                >
                  <span className="text-xl">{achievement.icon}</span>
                  <div>
                    <div className="font-medium text-green-800">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-green-600">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex justify-center gap-2">
        {[
          { key: "all", label: "All" },
          { key: "unlocked", label: "Unlocked" },
          { key: "locked", label: "Locked" },
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            variant={filter === filterOption.key ? "soft" : "ghost"}
            size="2"
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Achievement Categories */}
      <div className="space-y-8">
        {Object.entries(categories).map(
          ([categoryName, categoryAchievements]) => {
            if (categoryAchievements.length === 0) return null;

            return (
              <div
                key={categoryName}
                className="bg-white p-6 rounded-lg border shadow-sm"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4 capitalize">
                  {categoryName === "milestone" && "🎯 Milestones"}
                  {categoryName === "streak" && "🔥 Streaks"}
                  {categoryName === "daily" && "📈 Daily Goals"}
                  {categoryName === "special" && "⭐ Special"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">
            No achievements found for the selected filter.
          </p>
        </div>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    isUnlocked: boolean;
    progress: number;
    maxProgress: number;
    progressPercentage: number;
    unlockedAt?: number;
  };
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const isInProgress = !achievement.isUnlocked && achievement.progress > 0;

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        achievement.isUnlocked
          ? "bg-green-50 border-green-200 shadow-sm"
          : isInProgress
            ? "bg-yellow-50 border-yellow-200"
            : "bg-gray-50 border-gray-200 opacity-75"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`text-2xl ${
            achievement.isUnlocked ? "grayscale-0" : "grayscale opacity-50"
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold ${
                achievement.isUnlocked
                  ? "text-green-800"
                  : isInProgress
                    ? "text-yellow-800"
                    : "text-gray-600"
              }`}
            >
              {achievement.title}
            </h3>
            {achievement.isUnlocked && (
              <span className="text-green-600">✅</span>
            )}
          </div>
          <p
            className={`text-sm mb-2 ${
              achievement.isUnlocked
                ? "text-green-700"
                : isInProgress
                  ? "text-yellow-700"
                  : "text-gray-500"
            }`}
          >
            {achievement.description}
          </p>

          {!achievement.isUnlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isInProgress ? "bg-yellow-500" : "bg-gray-300"
                  }`}
                  style={{ width: `${achievement.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {achievement.isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-green-600 mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
