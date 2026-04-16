import { requireSession } from "@/app/data/session/require-session";
import { UserDetailsSection } from "@/components/user/user-details-section";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CourseCard } from "./_components/subject-card";
import { getProfessorSubjects } from "@/app/data/professor/get-professor-courses";

export default async function ProfessorPage() {
  const [session, { professor, assignments }] = await Promise.all([
    requireSession(),
    getProfessorSubjects(),
  ]);

  const professorDetails = [
    { label: "Department", value: professor.department || "Not specified" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2 p-4 py-6">
        <div>
          <UserDetailsSection user={session.user} details={professorDetails} />
          <h1 className="mt-4">
            Welcome back!{" "}
            <span className="font-bold text-primary">{session.user.name}</span>{" "}
            Here is your subjects overview.
          </h1>
        </div>

        {!assignments || assignments.length === 0 ? (
          <div className="py-4">
            <p className="text-muted-foreground">
              You are not assigned to any subjects yet.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your subjects</h2>
              <Link
                href="/professor/subject"
                className={buttonVariants({
                  variant: "ghost",
                  className: "underline hover:text-primary",
                })}
              >
                View all subjects
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              {assignments.map((assignment, i) => (
                <CourseCard key={i} assignment={assignment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
