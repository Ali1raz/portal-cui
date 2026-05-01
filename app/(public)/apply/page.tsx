import { Metadata } from "next";
import { getCurrentSemester } from "@/app/data/user/user-get-current-semester";
import { ApplyForm } from "../_components/apply-form";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Apply for admissions",
  description: "Apply for registration by selecting available semester.",
};

export default async function ApplyPage(props: PageProps<"/apply">) {
  const searchParams = await props.searchParams;
  const id = Array.isArray(searchParams.id)
    ? searchParams.id[0]
    : searchParams.id;

  const [{ currentSemesters, activeApplications }] = await Promise.all([
    getCurrentSemester(),
  ]);

  if (currentSemesters.length === 0) {
    return (
      <div className="w-full min-h-72 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">No registrations Available</h1>
        <p className="text-muted-foreground">
          There are currently no active registrations open.
        </p>
      </div>
    );
  }

  if (activeApplications) {
    return (
      <div className="w-full min-h-72 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">
          You already have existing application
        </h1>
        <p className="text-muted-foreground max-w-xl text-center">
          You have already submitted an application. Please wait for the review
          process to complete before submitting a new application. You can check
          the status of your existing application in the &quot;My
          Applications&quot; page.
        </p>

        <Link
          href="/my-applications"
          className={buttonVariants({ size: "sm", className: "mt-4" })}
        >
          My Applications
        </Link>
      </div>
    );
  }

  return (
    <main className="mb-32 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Apply for Registeration</h1>
        <p className="text-muted-foreground">
          Fill in the following details to apply for registration:
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {currentSemesters.map((semester) => (
          <Link
            href={`/apply?id=${semester.id}`}
            key={semester.id}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "flex flex-col h-auto py-4 items-start gap-4",
              id === semester.id && "border-primary! bg-primary/10! border-2"
            )}
          >
            <div className="space-y-1">
              <div>
                Semester:{" "}
                <span className="text-muted-foreground">
                  {semester.department}
                </span>
              </div>
              <div>
                Registrations:{" "}
                <span className="text-foreground">
                  {semester._count.registrations}
                </span>
              </div>
              <div className="text-muted-foreground">
                Applications:{" "}
                <span className="text-foreground">
                  {semester._count.studentApplications}
                </span>
              </div>
            </div>
            <div className="text-sm dark:text-red-300 text-red-500">
              Closes on{" "}
              <span className="text-foreground">
                {formatDate(semester.registrationEnd)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Separator className="my-6" />

      {!id ? (
        <div className="w-full mt-40 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">Select Department</h1>
          <p className="text-muted-foreground">
            Please select a department to start your application.
          </p>
        </div>
      ) : (
        <ApplyForm
          id={id}
          department={
            currentSemesters.find((sem) => sem.id === id)?.department || null
          }
        />
      )}
    </main>
  );
}
