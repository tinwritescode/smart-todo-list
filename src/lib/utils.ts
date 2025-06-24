import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const todoDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (todoDate.getTime() === today.getTime()) {
    return `Today ${timeString}`;
  } else if (todoDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow ${timeString}`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function isEndOfDay(timestamp: number): boolean {
  const date = new Date(timestamp);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return Math.abs(date.getTime() - endOfDay.getTime()) < 30 * 60 * 1000; // Within 30 minutes of end of day
}

export function sendNotification(message: string) {
  window.postMessage({ type: "notification", message }, "*");
}
