"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Link from "next/link";

export default function Error() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
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

      <span className="text-muted-foreground mb-6 text-[6rem] leading-none font-extrabold select-none">
        404
      </span>
      <h1 className="text-foreground mb-2 text-3xl font-bold">
        Oops, something bad happened
      </h1>
      {/* <p className="text-muted-foreground mb-8 max-w-md text-center text-lg">
        Go home
      </p> */}

      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/80 mb-10 rounded-md px-6 py-2 font-semibold shadow transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
