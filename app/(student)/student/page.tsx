import { Metadata } from "next";
import { getStudentSubjects } from "@/app/data/student/get-student-subjects";
import { SubjectCard } from "./_components/subject-card";
import { studentGetSubjectsToEnroll } from "@/app/data/student/get-subject-to-enroll";
import { SubjectsToEnrollTable } from "./_components/subjects-to-enroll-table";
import { getStudentBanners } from "@/app/data/student/get-student-banners-data";
import StudentBanner from "./_components/student-banner";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your enrolled subjects and available courses for enrollment.",
};

export default async function StudentPage() {
  const [subjects, subj, banners] = await Promise.all([
    getStudentSubjects(),
    studentGetSubjectsToEnroll(),
    getStudentBanners(),
  ]);

  return (
    <>
      {banners.map((b) => (
        <StudentBanner
          key={b.type === "enrollment" ? "enrollment" : `${b.type}-${b.id}`}
          banner={b}
        />
      ))}
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
