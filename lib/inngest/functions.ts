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

export const handleLeaveRequestStatusChange = inngest.createFunction(
  { id: "leave-request-status-change" },
  { event: "leaveRequest/status.changed" },
  async ({ event, step }) => {
    const { leaveRequestId, requestDate } = event.data;
    // wait until requestDate to update leaverequest status to rejected if it is still pending
    // dev test for 1minute
    // const until = new Date(Date.now() + 60 * 1000); // 1 minute from now

    await step.sleepUntil(
      "wait-until-request-date",
      `${new Date(requestDate).toISOString()}`
    );

    await step.run("update-leave-request-status", async () => {
      await prisma.leaveRequest.update({
        where: {
          id: leaveRequestId,
          status: "PENDING",
          date: new Date(requestDate),
        },
        data: { status: "REJECTED" },
      });
    });
  }
);
