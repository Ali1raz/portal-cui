import { CreateComplaintForm } from "./_components/create-complain-form";

export default function NewCompliant() {
  return (
    <div className="px-4 md:px-6 my-6 max-w-6xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">New Complaint</h1>
        <p className="text-muted-foreground text-sm">
          Fill in the follwing details to create new complaint. This will sent
          to your department HOD for further analysis.
        </p>
      </div>
      <CreateComplaintForm />
    </div>
  );
}
