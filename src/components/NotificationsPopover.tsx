import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Bell } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

export function NotificationsPopover() {
  const notifications = useQuery(api.notifications.list);
  const markAsRead = useMutation(api.notifications.markAsRead);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    await markAsRead({ id });
  };

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button className="relative p-2 rounded-md hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-80 rounded-lg border bg-white p-0 text-gray-900 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          side="bottom"
          align="end"
          sideOffset={5}
        >
          <ScrollAreaPrimitive.Root className="h-[320px] w-full">
            <ScrollAreaPrimitive.Viewport className="h-full w-full">
              <div className="flex flex-col gap-1 p-2">
                {!notifications || notifications.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 p-4">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "flex flex-col gap-1 rounded-lg p-3 text-sm transition-colors hover:bg-gray-100 cursor-pointer",
                        !notification.isRead && "bg-gray-50"
                      )}
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <div className="line-clamp-2">{notification.message}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollAreaPrimitive.Scrollbar
              className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors hover:bg-gray-200"
              orientation="vertical"
            >
              <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-lg bg-gray-300" />
            </ScrollAreaPrimitive.Scrollbar>
          </ScrollAreaPrimitive.Root>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
