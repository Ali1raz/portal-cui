import prisma from "../prisma";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  }
);

export const handleAnnouncementSchedule = inngest.createFunction(
  { id: "announcement-schedule" },
  { event: "announcement/scheduled" },
  async ({ event, step }) => {
    const { announcementId, scheduleDate } = event.data;
    const targetDate = new Date(scheduleDate);

    if (Number.isNaN(targetDate.getTime())) {
      throw new Error("Invalid schedule date provided for announcement.");
    }
    // This method pauses execution until a specific date time.
    // Any date time string in the format accepted by the Date object,
    // for example YYYY-MM-DD or YYYY-MM-DDHH:mm:ss.
    // At maximum, functions can sleep for a year
    // (seven days for the free tier plans).
    await step.sleepUntil(
      "wait-until-scheduled-time",
      `${targetDate.toISOString()}`
    );

    await step.run("publish-announcement", async () => {
      await prisma.announcement.update({
        where: { id: announcementId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          scheduledFor: null,
        },
      });
    });

    return { announcementId, message: `Announcement published!` };
  }
);
