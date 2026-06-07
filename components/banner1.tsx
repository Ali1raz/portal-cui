"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Route } from "next";
import Link from "next/link";

interface Banner1Props {
  title: string;
  description?: string;
  linkText?: string;
  linkUrl?: Route;
  defaultVisible?: boolean;
  className?: string;
}

const Banner1 = ({
  title,
  description,
  linkText,
  linkUrl,
  defaultVisible = true,
  className,
}: Banner1Props) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border border-t-0 bg-background px-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <span className="text-sm">
            <span className="font-medium">{title}</span>{" "}
            <span className="text-muted-foreground">
              {description || null}{" "}
              {linkUrl && (
                <Link
                  href={linkUrl}
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  {linkText}
                </Link>
              )}
              .
            </span>
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="-mr-2 h-8 w-8 flex-none"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export { Banner1 };
