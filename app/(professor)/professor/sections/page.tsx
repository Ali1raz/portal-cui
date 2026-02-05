import { Suspense } from "react";
import { getProfessorSections } from "@/app/data/professor/get-professor-sections";
import { SectionCard, SectionCardSkeleton } from "../_components/section-card";

async function SectionsContent() {
  const { assignments } = await getProfessorSections();

  return (
    <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {assignments.map((assignment) => (
        <SectionCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}

export default function SectionPage() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="font-bold text-2xl">All Sections</h1>
      <Suspense fallback={<SectionCardSkeleton />}>
        <SectionsContent />
      </Suspense>
    </div>
  );
}
