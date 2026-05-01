import { Metadata } from "next";
import { isProfessorBA } from "@/app/data/professor/get-professor-details";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Batch Advisor",
  description:
    "Batch advisor dashboard — manage complaints and leave requests of your department.",
};

export default async function BatchAdvisorDashboardPage() {
  const isBA = await isProfessorBA();
  if (!isBA) {
    return redirect("/professor");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 p-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Complaints</h2>
          <Link
            href="/batch-advisor/complaints"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "underline hover:text-primary",
            })}
          >
            All complaints
          </Link>
        </div>
      </div>
    </div>
  );
}
