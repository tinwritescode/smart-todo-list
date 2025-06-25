import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "@/SignOutButton";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { IncomingTodos } from "@/components/IncomingTodos";
import { IncomingCount } from "@/components/IncomingCount";
import { Button } from "@radix-ui/themes";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Authenticated } from "convex/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showIncoming, setShowIncoming] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.todos.getCurrentUserProfile);
  const updateUserSettings = useMutation(api.todos.updateUserSettings);

  // Update last active time when user interacts with the app
  useEffect(() => {
    if (loggedInUser) {
      let timeoutId: NodeJS.Timeout;
      let lastUpdate = 0;
      const DEBOUNCE_DELAY = 5 * 60 * 1000; // 5 minutes

      const updateActivity = () => {
        const now = Date.now();
        if (now - lastUpdate >= DEBOUNCE_DELAY) {
          lastUpdate = now;
          updateUserSettings({ lastActiveTime: now });
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            lastUpdate = Date.now();
            updateUserSettings({ lastActiveTime: lastUpdate });
          }, DEBOUNCE_DELAY);
        }
      };

      updateActivity();

      window.addEventListener("mousemove", updateActivity);
      window.addEventListener("keydown", updateActivity);

      return () => {
        window.removeEventListener("mousemove", updateActivity);
        window.removeEventListener("keydown", updateActivity);
        clearTimeout(timeoutId);
      };
    }
  }, [loggedInUser]);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Smart Todo</h2>
          </Link>
          <Button
            variant="ghost"
            size="2"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          >
            {isMobileNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-white border-r z-20 flex flex-col transition-transform duration-200 ease-in-out",
            isMobileNavOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo - Desktop Only */}
          <div className="hidden md:flex items-center gap-2 p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Smart Todo
              </h2>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col">
            <nav className="flex flex-col gap-2 p-3">
              <Button
                asChild
                variant="ghost"
                size="2"
                className={cn(
                  "w-full justify-start hover:bg-gray-100 transition-colors",
                  location.pathname === "/" && "bg-gray-100 font-medium"
                )}
              >
                <Link to="/">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <span className="text-xl text-gray-700">✓</span>
                    <span className="font-medium text-gray-900">Tasks</span>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="2"
                className={cn(
                  "w-full justify-start hover:bg-gray-100 transition-colors",
                  location.pathname === "/achievements" &&
                    "bg-gray-100 font-medium"
                )}
              >
                <Link to="/achievements">
                  <div className="flex items-center gap-3 px-2 py-1">
                    <span className="text-xl text-gray-700">🏆</span>
                    <span className="font-medium text-gray-900">
                      Achievements
                    </span>
                  </div>
                </Link>
              </Button>

              <Authenticated>
                <Button
                  asChild
                  variant="ghost"
                  size="2"
                  className={cn(
                    "w-full justify-start hover:bg-gray-100 transition-colors",
                    (location.pathname === "/profile" ||
                      location.pathname.startsWith("/profile/")) &&
                      "bg-gray-100 font-medium"
                  )}
                >
                  <Link
                    to={
                      profile?.profile
                        ? `/profile/${profile.profile.username}`
                        : "/profile/edit"
                    }
                  >
                    <div className="flex items-center gap-3 px-2 py-1">
                      <span className="text-xl text-gray-700">👤</span>
                      <span className="font-medium text-gray-900">Profile</span>
                    </div>
                  </Link>
                </Button>

                {location.pathname === "/" && (
                  <div className="mt-3 space-y-2">
                    <Button
                      onClick={() => setShowIncoming(!showIncoming)}
                      variant="ghost"
                      className="w-full justify-start hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 px-2 py-1">
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform text-gray-600",
                            showIncoming && "rotate-180"
                          )}
                        />
                        <span className="text-gray-900">Incoming Tasks</span>
                        <div className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-sm font-medium">
                          <IncomingCount />
                        </div>
                      </div>
                    </Button>
                    <div
                      className={cn(
                        showIncoming ? "block" : "hidden",
                        "pl-8 space-y-2"
                      )}
                    >
                      <IncomingTodos />
                    </div>
                  </div>
                )}
              </Authenticated>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between gap-2">
              <Authenticated>
                <NotificationsPopover />
              </Authenticated>
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:ml-64">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
