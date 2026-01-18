import { getProfessorSections } from "@/app/data/professor/get-professor-sections";
import { UserImage } from "@/components/user/user-image";
import { formatDate } from "@/lib/utils";
import { SectionCard } from "./_components/section-card";

export default async function ProfessorPage() {
  const { professor, assignments } = await getProfessorSections();

  if (!assignments || assignments.length === 0) {
    return <div>You are not assigned to any sections YET.</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
        <div className="flex flex-col">
          <div className="flex sm:items-start flex-col sm:flex-row gap-4">
            <div className="size-32">
              <UserImage
                className="rounded-full w-full h-full"
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
        <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {assignments.map((assignment) => (
            <SectionCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </div>
    </div>
  );
}
