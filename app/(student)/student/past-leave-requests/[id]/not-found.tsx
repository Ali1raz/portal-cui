import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ban } from "lucide-react";

export default function LeaveRequestNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="bg-primary/10 rounded-full p-4 mb-2">
            <Ban className="size-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Leave Request Not Found</h1>
          <p className="text-center text-muted-foreground">
            The leave request you are looking for does not exist or you do not
            have permission to view it.
          </p>
          <Button asChild>
            <Link href="/student/past-leave-requests">View All Requests</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
