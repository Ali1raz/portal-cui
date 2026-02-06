import { adminGetAllSubjects } from "@/app/data/admin/get-all-subjects";
import {
  AdminSubjectCardSkeleton,
  AdminSubjectCard,
} from "./_components/admin-subject-card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Suspense } from "react";

export default async function SubjectsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">All Subjects</h1>
        <Link href={"/admin/subjects/create"} className={buttonVariants({})}>
          Create subject
        </Link>
      </div>
      <Suspense fallback={<SubjectSkelton />}>
        <SubjectsList />
      </Suspense>
    </div>
  );
}

async function SubjectsList() {
  const subjects = await adminGetAllSubjects();

  return (
    <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
      {subjects.map((subject) => (
        <AdminSubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
}

function SubjectSkelton() {
  return (
    <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <AdminSubjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
