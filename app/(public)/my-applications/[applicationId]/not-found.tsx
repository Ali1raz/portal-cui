"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Ban } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

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
          <h1 className="text-2xl font-bold">Application Not Found</h1>
          <p className="text-center text-muted-foreground">
            The application you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft data-icon="inline-start" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
