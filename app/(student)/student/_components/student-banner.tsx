import { Banner1 } from "@/components/banner1";
import type { StudentBannerType } from "@/app/data/student/get-student-banners-data";
import { Route } from "next";

export function StudentBanner({ banner }: { banner: StudentBannerType }) {
  if (banner.type === "enrollment") {
    return (
      <Banner1
        title="Last date to enroll"
        description={new Date(banner.enrollmentEnd).toLocaleString(undefined, {
          month: "short",
          day: "2-digit",
          year: "numeric",
          weekday: "long",
        })}
        className="bg-amber-200/50 text-amber-800 dark:bg-amber-500/30 dark:text-amber-200"
      />
    );
  }

  if (banner.type === "leave-review") {
    return (
      <Banner1
        title="Leave request update requested"
        description={`Click to update details.`}
        linkText="Open request"
        linkUrl={`/student/past-leave-requests/${banner.id}` as Route}
        className="bg-red-500/30"
      />
    );
  }

  if (banner.type === "complaint-review") {
    return (
      <Banner1
        title="Complaint update requested"
        description={`Click to update details.`}
        linkText="Open complaint"
        linkUrl={`/student/complaints/${banner.id}` as Route}
        className="bg-red-500/30"
      />
    );
  }

  return null;
}

export default StudentBanner;
