"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="text-center text-muted-foreground">
            The page you&apos;re looking for might have been moved or
            doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
