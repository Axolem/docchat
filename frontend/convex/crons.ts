import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "clear messages table",
//   { minutes: 1 }, // every minute
//   internal.messages.clearAll,
// );

crons.monthly(
	"clear all calls",
	{ day: 1, hourUTC: 16, minuteUTC: 0 }, // Every month on the first day at 8:00am PST
	internal.user.clearAllCalls
);

// // An alternative way to create the same schedule as above with cron syntax
// crons.cron(
//   "payment reminder duplicate",
//   "0 16 1 * *",
//   internal.payments.sendPaymentEmail,
//   { email: "my_email@gmail.com" }, // argument to sendPaymentEmail
// );

export default crons;
