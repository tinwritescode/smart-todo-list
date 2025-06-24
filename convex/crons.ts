import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run notifications check every hour
crons.interval(
  "send-notifications",
  { hours: 1 },
  internal.notifications.sendHourlyNotifications,
  {}
);

export default crons;
