import { Suspense } from "react";
import { CourseCard, SectionCardSkeleton } from "../_components/subject-card";
import { getProfessorSubjects } from "@/app/data/professor/get-professor-courses";

async function SectionsContent() {
  const { assignments } = await getProfessorSubjects();

  return (
    <div className="my-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
      {assignments.map((assignment) => (
        <CourseCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}

export default function SectionPage() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="font-bold text-2xl">Your classes</h1>
      <Suspense fallback={<SectionCardSkeleton />}>
        <SectionsContent />
      </Suspense>
    </div>
  );
}
