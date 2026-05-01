"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-muted">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="max-w-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="bg-primary/10 rounded-full p-4 mb-2">
            <CircleAlert className="size-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            Internal Server Error
          </h1>
          <p className="text-center text-muted-foreground">
            Something went wrong on our end. Please try again later or contact
            support.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
