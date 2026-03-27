import { getStudentSubjects } from "@/app/data/student/get-student-subjects";
import { SubjectCard } from "./_components/subject-card";

export default async function StudentPage() {
  const subjects = await getStudentSubjects();

  return (
    <div className="flex flex-1 flex-col max-w-5xl">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="space-y-4 p-4">
          <h1>Welcome back! Here is your academic overview.</h1>
          {subjects.length > 0 ? (
            <p>
              You are currently enrolled in {subjects.length}{" "}
              {subjects.length === 1 ? "subject" : "subjects"}
            </p>
          ) : (
            <p>You are not enrolled in any subjects.</p>
          )}
          <div className="my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 xl:grid-cols-2">
            {subjects.map((subject) => (
              <SubjectCard key={subject.code} subject={subject} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
