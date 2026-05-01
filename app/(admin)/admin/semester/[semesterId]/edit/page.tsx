import { Metadata } from "next";
import { adminGetSemesterdetails } from "@/app/data/admin/get-semester-details";
import { EditSemesterForm } from "../../_components/edit-semester-form";

export const metadata: Metadata = {
  title: "Edit Semester",
  description: "Update semester dates, deadlines, and activation settings.",
};

export default async function SemesterEditPage(
  props: PageProps<"/admin/semester/[semesterId]/edit">
) {
  const { semesterId } = await props.params;
  const { semester } = await adminGetSemesterdetails(semesterId);

  return (
    <div className="w-full max-w-5xl">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold">Edit Semester</h1>
      </div>

      <EditSemesterForm
        semesterId={semesterId}
        initialValues={{
          semester: semester.semester,
          year: semester.year,
          department: semester.department,
          batch: semester.batch,
          startDate: semester.startDate,
          endDate: semester.endDate,
          registrationStart: semester.registrationStart,
          registrationEnd: semester.registrationEnd,
          enrollmentStart: semester.enrollmentStart,
          enrollmentEnd: semester.enrollmentEnd,
          addDeadline: semester.addDeadline,
          dropDeadline: semester.dropDeadline,
          lateDropDeadline: semester.lateDropDeadline,
          isActive: semester.isActive,
        }}
      />
    </div>
  );
}
