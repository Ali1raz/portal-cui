import { getProfessorSections } from "@/app/data/professor/get-professor-sections";
import { UserImage } from "@/components/general/user-image";
import { SectionCard } from "./_components/section-card";

export default async function ProfessorPage() {
  const { professor, assignments } = await getProfessorSections();

  if (!assignments || assignments.length === 0) {
    return <div>You are not assigned to any sections YET.</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1>
              Welcome back{" "}
              <span className="text-primary font-semibold">
                {professor.user.name}
              </span>
              ! Here is your academic overview.
            </h1>
            <div>
              <UserImage
                image={professor.user.image}
                name={professor.user.name}
                className="size-24"
              />
            </div>
          </div>
          <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {assignments.map((assignment) => (
              <SectionCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
