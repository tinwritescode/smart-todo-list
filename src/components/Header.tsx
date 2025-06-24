import { Authenticated, Unauthenticated } from "convex/react";
import { SignOutButton } from "../SignOutButton";
import { NotificationsPopover } from "./NotificationsPopover";
import { IncomingCount } from "./IncomingCount";
import { IncomingTodos } from "./IncomingTodos";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@radix-ui/themes";

interface HeaderProps {
  currentPage: "todos" | "achievements";
  setCurrentPage: (page: "todos" | "achievements") => void;
  showIncoming: boolean;
  setShowIncoming: (show: boolean) => void;
}

export function Header({
  currentPage,
  setCurrentPage,
  showIncoming,
  setShowIncoming,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 h-14 flex items-center">
        <div className="mr-4 flex">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Smart Todo</span>
          </a>
        </div>
        <div className="flex-1 flex items-center justify-between">
          <NavigationMenu.Root>
            <NavigationMenu.List className="flex gap-1">
              <NavigationMenu.Item>
                <NavigationMenu.Trigger asChild>
                  <Button
                    onClick={() => setCurrentPage("todos")}
                    variant={currentPage === "todos" ? "soft" : "ghost"}
                    size="2"
                    className="relative"
                  >
                    Tasks
                  </Button>
                </NavigationMenu.Trigger>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <NavigationMenu.Trigger asChild>
                  <Button
                    onClick={() => setCurrentPage("achievements")}
                    variant={currentPage === "achievements" ? "soft" : "ghost"}
                    size="2"
                  >
                    🏆 Achievements
                  </Button>
                </NavigationMenu.Trigger>
              </NavigationMenu.Item>
            </NavigationMenu.List>
          </NavigationMenu.Root>
          <div className="flex items-center gap-2">
            <Authenticated>
              <NotificationsPopover />
            </Authenticated>
            <SignOutButton />
          </div>
        </div>
      </div>
      <Authenticated>
        {currentPage === "todos" && (
          <div className="container px-4 py-2">
            <Button
              onClick={() => setShowIncoming(!showIncoming)}
              variant="ghost"
              className="flex items-center gap-2 text-sm w-full justify-start h-auto py-2 hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-2 flex-1">
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showIncoming && "rotate-180"
                  )}
                />
                <span className="font-medium">Incoming Tasks</span>
              </div>
              <IncomingCount />
            </Button>
            <div className={cn(showIncoming ? "block" : "hidden", "mt-2")}>
              <IncomingTodos />
            </div>
          </div>
        )}
      </Authenticated>
    </header>
  );
}
