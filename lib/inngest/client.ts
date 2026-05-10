import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "portal-cui",
  isDev: process.env.NODE_ENV !== "production",
});
