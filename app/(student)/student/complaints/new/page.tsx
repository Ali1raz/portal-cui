import { Metadata } from "next";
import { CreateComplaintForm } from "./_components/create-complain-form";

export const metadata: Metadata = {
  title: "New Complaint",
  description: "Submit a new complaint to your department batch advisor.",
};

export default function NewCompliant() {
  return (
    <div className="px-4 md:px-6 my-6 max-w-6xl w-full">
      <div className="my-4">
        <h1 className="text-lg font-semibold">New Complaint</h1>
        <p className="text-muted-foreground text-sm">
          Fill in the follwing details to create new complaint. This will sent
          to your department batch-advisor for further review.
        </p>
      </div>
      <CreateComplaintForm />
    </div>
  );
}
