import { Metadata } from "next";
import { CreateSemesterForm } from "../_components/create-semester-form";

export const metadata: Metadata = {
  title: "Create Semester",
  description: "Set up a new semester with registration and enrollment dates.",
};

export default function CreateNewSemester() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Semester</h1>
      <CreateSemesterForm />
    </div>
  );
}
