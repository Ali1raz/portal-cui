import { Metadata } from "next";
import { CreateSubjectForm } from "./_components/create-subject-form";

export const metadata: Metadata = {
  title: "Create Subject",
  description: "Add a new subject with code and credit hour details.",
};

export default function CreateSubject() {
  return (
    <div className="max-w-3xl w-full">
      <div className="mb-8 space-y-2">
        <h1 className="text-xl font-medium">Create Subject</h1>
        <p className="text-muted-foreground">
          Add following details to create a new subject.
        </p>
      </div>
      <CreateSubjectForm />
    </div>
  );
}
