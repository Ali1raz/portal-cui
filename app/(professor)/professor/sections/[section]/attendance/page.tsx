import { Suspense } from "react";
import { getProfessorSectionStudents } from "@/app/data/professor/get-professor-students";
import { AttendanceTable } from "./_components/attendence-table";

export default async function AttendencePage(
  props: PageProps<"/professor/sections/[section]/attendance">
) {
  const section = (await props.params).section;
  const students = await getProfessorSectionStudents({ section });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <div className="flex items-start sm:flex-row flex-col sm:justify-between justify-start gap-4">
            <h1>
              Manage attendence of students of class{" "}
              <span className="text-primary font-semibold">
                <Suspense fallback={<span>Loading...</span>}>
                  {section}
                </Suspense>
              </span>
            </h1>
          </div>
          <AttendanceTable students={students} />
        </div>
      </div>
    </div>
  );
}
