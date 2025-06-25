import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "../components/ui/card";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Button } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import {
  Loader2,
  Trophy,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt: number | undefined;
  progress: number;
  maxProgress: number;
  progressPercentage: number;
};

export default function ProfilePage() {
  const { username } = useParams();
  const profile = useQuery(api.todos.getUserProfile, {
    username: username ?? "",
  });
  const achievements = useQuery(api.achievements.getUserAchievements);

  if (!username) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mt-2">Username was not provided.</p>
          <Button asChild className="mt-4">
            <Link to="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (profile === undefined || achievements === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            This profile doesn't exist or is private.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6 flex-col sm:flex-row">
          <div className="relative">
            {profile.profile.avatarUrl ? (
              <img
                src={profile.profile.avatarUrl}
                alt={profile.profile.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl text-gray-500">
                  {profile.profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.profile.username}</h1>
              {profile.profile.userId === profile?.profile?.userId && (
                <Button asChild variant="soft" size="2">
                  <Link to="/profile/edit">Edit Profile</Link>
                </Button>
              )}
            </div>
            {profile.profile.bio && (
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                {profile.profile.bio}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div>
            <div className="text-2xl font-bold">
              {profile.stats?.totalCompleted ?? 0}
            </div>
            <div className="text-gray-600">Tasks Completed</div>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold">
              {profile.stats?.currentStreak ?? 0}
            </div>
            <div className="text-gray-600">Current Streak</div>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <div>
            <div className="text-2xl font-bold">
              {profile.stats?.longestStreak ?? 0}
            </div>
            <div className="text-gray-600">Longest Streak</div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement: Achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg bg-gray-50 border flex items-start gap-3"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">
                    {achievement.description}
                  </p>
                  {achievement.unlockedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      Earned{" "}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Heatmap */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <ScrollArea.Root className="w-full overflow-hidden">
          <ScrollArea.Viewport className="w-full">
            <ActivityHeatmap userId={profile.profile.userId} />
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors duration-[160ms] ease-out hover:bg-gray-200 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Card>

      {/* Social Links */}
      {profile.profile.socialLinks &&
        profile.profile.socialLinks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Connect</h2>
            <div className="flex flex-wrap gap-4">
              {profile.profile.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800"
                >
                  {link.platform}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </Card>
        )}
    </div>
  );
}
