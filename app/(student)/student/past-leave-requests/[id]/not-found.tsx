import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LeaveRequestNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Leave Request Not Found</h1>
        <p className="text-muted-foreground">
          The leave request you are looking for does not exist or you do not
          have permission to view it.
        </p>
      </div>
      <Button asChild>
        <Link href="/student/past-leave-requests">View All Requests</Link>
      </Button>
    </div>
  );
}
