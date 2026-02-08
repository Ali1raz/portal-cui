import { UserImage } from "@/components/user/user-image";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CourseCard } from "./_components/subject-card";
import { getProfessorSubjects } from "@/app/data/professor/get-professor-courses";

export default async function ProfessorPage() {
  const { professor, assignments } = await getProfessorSubjects();
  console.log(assignments.length);

  if (!assignments || assignments.length === 0) {
    return <div>You are not assigned to any sections YET.</div>;
  }

  return (
    <div className="flex flex-1 flex-col w-full max-w-6xl mx-auto">
      <div className="@container/main flex flex-1 flex-col p-4 ">
        <div className="flex flex-col">
          <div className="flex sm:items-start flex-col sm:flex-row gap-4">
            <div className="size-32">
              <UserImage
                className="rounded-full w-full h-full size-30"
                name={professor.user.name}
                image={professor.user.image}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold">{professor.user.name}</h1>
              <h2 className="flex items-center gap-2">
                {professor.user.email}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center text-sm gap-4 border-y p-2 my-6">
            {[
              { label: "Joined", value: formatDate(professor.createdAt) },
              { label: "Trust level", value: professor.user.role },
            ].map((item, i) => (
              <div key={i}>
                <span className="text-muted-foreground/80">{item.label}: </span>
                <span>{item?.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between ">
          <h2 className="text-xl font-bold">Your classes</h2>
          <Link
            href="/professor/subject"
            className={buttonVariants({
              variant: "ghost",
              className: "self-end underline hover:text-primary mt-2",
            })}
          >
            View all sections
          </Link>
        </div>
        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {assignments.map((assignment, i) => (
            <CourseCard key={i} assignment={assignment} />
          ))}
        </div>
      </div>
    </div>
  );
}
