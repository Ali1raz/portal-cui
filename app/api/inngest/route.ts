import { inngest } from "@/lib/inngest/client";
import {
  handleAnnouncementSchedule,
  helloWorld,
  onSemesterFeePublished,
  onStudentRegistrationApproved,
  createStudentFeeRecord,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    handleAnnouncementSchedule,
    onSemesterFeePublished,
    onStudentRegistrationApproved,
    createStudentFeeRecord,
  ],
});
