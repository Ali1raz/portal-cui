import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="max-w-md ">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="bg-primary/10 rounded-full p-4 mb-2">
            <IconLock className="size-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Access Denied</h1>
          <p className="text-center text-muted-foreground">
            You are not authorized to access this page.
            <br />
            Please contact your administrator if you believe this is a mistake.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
