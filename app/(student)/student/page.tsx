import { Metadata } from "next";
import { getStudentSubjects } from "@/app/data/student/get-student-subjects";
import { SubjectCard } from "./_components/subject-card";
import { studentGetSubjectsToEnroll } from "@/app/data/student/get-subject-to-enroll";
import { SubjectsToEnrollTable } from "./_components/subjects-to-enroll-table";
import { studentGetEnrollemntLastDate } from "@/app/data/student/get-enrollment-last-date";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your enrolled subjects and available courses for enrollment.",
};

export default async function StudentPage() {
  const [subjects, subj, date] = await Promise.all([
    getStudentSubjects(),
    studentGetSubjectsToEnroll(),
    studentGetEnrollemntLastDate(),
  ]);

  return (
    <>
      {date && (
        <div className="w-full py-1 bg-orange-200 text-orange-900 text-sm flex items-center justify-center gap-2 max-sm:text-[10px]">
          <span>Last date to enroll:</span>
          <span>{format(date, "LLL dd uuuu - EEEE")}</span>
        </div>
      )}
      <section className="@container/main max-w-7xl">
        <div className="space-y-4 p-4">
          <h1>Welcome back! Here is your academic overview.</h1>
          <div className="my-8">
            {subjects && <SubjectsToEnrollTable data={subj} />}
          </div>
          <div className="my-2 grid grid-cols-1 @xl/main:grid-cols-2 gap-2">
            {subjects.map((subject) => (
              <SubjectCard key={subject.code} subject={subject} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
