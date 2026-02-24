"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div className="fixed top-4 right-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <ThemeToggle />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Empty>
        <EmptyHeader>
          <EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
            404
          </EmptyTitle>
          <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
            The page you&apos;re looking for might have been <br />
            moved or doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <HomeIcon data-icon="inline-start" />
              Go Home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
    // <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
    //   <div className="fixed top-4 right-4 z-50">
    //     <Tooltip>
    //       <TooltipTrigger asChild>
    //         <ThemeToggle />
    //       </TooltipTrigger>
    //       <TooltipContent side="bottom">
    //         <p className="text-xs">Toggle theme</p>
    //       </TooltipContent>
    //     </Tooltip>
    //   </div>

    //   <span className="text-muted-foreground mb-6 text-[6rem] leading-none font-extrabold select-none">
    //     404
    //   </span>
    //   <h1 className="text-foreground mb-2 text-3xl font-bold">
    //     Oops, Lost in Space?
    //   </h1>
    //   {/* <p className="text-muted-foreground mb-8 max-w-md text-center text-lg">
    //     Go home
    //   </p> */}

    //   <Link
    //     href="/"
    //     className="bg-primary text-primary-foreground hover:bg-primary/80 mb-10 rounded-md px-6 py-2 font-semibold shadow transition-colors"
    //   >
    //     Back to Home
    //   </Link>
    // </div>
  );
}
