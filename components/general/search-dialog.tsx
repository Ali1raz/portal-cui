"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getNavLinks } from "../sidebar/navlinks";
import { Route } from "next";
import { Role } from "@/lib/generated/prisma/enums";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function SearchDialog({ role }: { role: Role | null | undefined }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const navlinks = getNavLinks({ userRole: role });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setQuery("");
  };

  const handleSelect = (href: Route) => {
    handleOpenChange(false);
    router.push(href);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => handleOpenChange(true)}
            variant="outline"
            className="text-muted-foreground"
          >
            <Search data-icon="inline-start" />
            <span className="sm:flex hidden gap-2">
              Search <Kbd>⌘ J</Kbd>
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2">
          Search <Kbd>⌘ J</Kbd>
        </TooltipContent>
      </Tooltip>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Search dashboard, profile, and more…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navlinks.map((item) => (
              <CommandItem
                className="rounded"
                key={item.href}
                value={item.title}
                onSelect={() => handleSelect(item.href as Route)}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
