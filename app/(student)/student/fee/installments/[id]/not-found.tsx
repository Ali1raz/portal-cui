"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="font-extrabold text-9xl">404</EmptyTitle>
          <EmptyDescription className="mt-8 text-nowrap text-foreground/80">
            This page you&apos;re looking for doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => router.back()}>
            <ArrowLeft data-icon="inline-start" />
            Go Back
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
