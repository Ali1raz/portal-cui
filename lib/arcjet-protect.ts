import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { format } from "date-fns";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "10m",
    max: 5,
  })
);

export async function protect(fingerprint: string): Promise<string | null> {
  const req = await request();
  const decision = await aj.protect(req, { fingerprint });

  if (!decision.isDenied()) {
    return null;
  }

  if (decision.reason.isBot()) {
    return "You are a bot.";
  }

  if (decision.reason.isRateLimit()) {
    return `You are making too many requests. Please try again later on: ${format(decision.reason.resetTime as Date, "MMMM d, yyyy hh:mm a")}.`;
  }

  return "You are not allowed!";
}
