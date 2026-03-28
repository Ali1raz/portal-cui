"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/tryCatch";
import { dropCourse, enrollCourse } from "../actions";
import { EnrollmentStatus } from "@/lib/generated/prisma/enums";

interface EnrollDropCourseButtonsProps {
  offeringId: string;
  enrollStatus: EnrollmentStatus;
}

export function EnrollDropCourseButtons({
  offeringId,
  enrollStatus,
}: EnrollDropCourseButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canEnroll = ["REJECTED", "DROPPED", "WITHDRAWN"].includes(enrollStatus);
  const canDrop = ["PENDING", "APPROVED"].includes(enrollStatus);

  function runEnroll() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(enrollCourse(offeringId));

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function runDrop() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(dropCourse(offeringId));

      if (error) {
        toast.error("Something bad happened. Please try again.");
        return;
      }

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  if (canEnroll) {
    return (
      <Button onClick={runEnroll} disabled={isPending} size="sm">
        {isPending ? "Enrolling..." : "Enroll"}
      </Button>
    );
  }

  if (canDrop) {
    return (
      <Button
        onClick={runDrop}
        disabled={isPending}
        size="sm"
        variant="destructive"
      >
        {isPending ? "Dropping..." : "Drop"}
      </Button>
    );
  }

  return (
    <Button disabled size="sm" variant="outline">
      Action N/A
    </Button>
  );
}
