"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CUILogo } from "./cui-logo";
import { SignOutButton } from "./signout-button";
import { getDashboardLinkForRole } from "@/components/sidebar/navlinks";
import { Role } from "@/lib/generated/prisma/enums";
import { Route } from "next";
import { useScroll } from "@/hooks/use-scroll";

type MenuItem = {
  name: string;
  href: Route;
  role?: Role;
};

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const session = useSession();
  const pathName = usePathname();
  const userRole = session.data?.user?.role as Role | undefined;
  const dashboardLink = getDashboardLinkForRole(userRole);
  const scrolled = useScroll(50);

  const menuItems: MenuItem[] = [
    ...(dashboardLink
      ? [{ name: "Dashboard", href: dashboardLink.href, role: userRole }]
      : []),
    { name: "HOD", href: "/hod", role: "HOD" },
    { name: "Professor", href: "/professor", role: "PROFESSOR" },
    { name: "Student", href: "/student", role: "STUDENT" },
    { name: "Director", href: "/director", role: "DIRECTOR" },
    { name: "Team", href: "#team", role: undefined },
  ];

  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 350);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);
  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav
        data-state={menuState && "active"}
        className="max-w-7xl mx-auto w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 px-6 transition-all duration-300 lg:px-12",
            scrolled &&
              "bg-background/50 rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <CUILogo
                textClasses="block max-[490px]:hidden font-medium"
                className="flex items-center gap-1"
              />

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-muted-foreground hover:text-accent-foreground block duration-150",
                        item.role && item.role === userRole && "text-primary",
                        pathName === item.href && "text-primary font-semibold"
                      )}
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-muted-foreground hover:text-accent-foreground block duration-150",
                          item.role && item.role === userRole && "text-primary",
                          pathName === item.href && "text-primary font-semibold"
                        )}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {!session?.data ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(scrolled && "lg:hidden")}
                    >
                      <Link href="/login">
                        <span>Login</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(scrolled && "lg:hidden")}
                    >
                      <Link href="/register">
                        <span>Sign Up</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <SignOutButton className={cn(scrolled && "lg:hidden")} />
                )}
                {session.data ? (
                  <Button
                    asChild
                    size="sm"
                    className={cn(scrolled ? "lg:inline-flex" : "hidden")}
                  >
                    <Link href="/profile">
                      <span>Profile</span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      "hidden lg:inline-flex",
                      !scrolled && "lg:hidden"
                    )}
                  >
                    <Link href="/register">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
