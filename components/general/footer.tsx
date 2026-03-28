"use client";

import Link from "next/link";
import { CUILogo } from "./cui-logo";
import { Route } from "next";
import { Button } from "../ui/button";
import { socialLinks } from "../footer";
import { ThemeToggle } from "../theme-toggle";

const links = [
  {
    group: "Admissions",
    items: [
      {
        title: "Apply",
        href: "/apply",
      },
      {
        title: "My Applications",
        href: "/my-applications",
      },
    ],
  },
  {
    group: "Solutions",
    items: [
      {
        title: "Director",
        href: "/director",
      },
      {
        title: "HOD",
        href: "/hod",
      },
      {
        title: "Students",
        href: "/student",
      },
      {
        title: "Professor",
        href: "/professor",
      },
      {
        title: "Batch Advisor",
        href: "/batch-advisor",
      },
      {
        title: "Clerk",
        href: "/clerk",
      },
    ],
  },
  {
    group: "Legal",
    items: [
      {
        title: "About",
        href: "/about",
      },
      {
        title: "Admissions",
        href: "/admissions",
      },
    ],
  },
];

export default function FooterSection() {
  return (
    <footer className="border-b pt-20">
      <div className="mb-8 border-b md:mb-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
          <CUILogo
            width={90}
            height={90}
            className="flex flex-col items-start sm:items-center sm:flex-row"
          />
          {/* <Link
            href="/"
            aria-label="Go to homepage"
            className="block relative size-26"
          >
            <Image src="/image.png" alt="CUI" fill />
          </Link> */}
          <div className="flex items-center gap-2">
            {socialLinks.map(({ href, label, icon }) => (
              <Button asChild key={label} size="sm" variant="ghost">
                <a aria-label={label} href={href}>
                  {icon}
                </a>
              </Button>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-5 md:gap-0 lg:grid-cols-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-5 md:row-start-1 lg:col-span-3">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 text-sm">
                <span className="block font-medium">{link.group}</span>
                {link.items.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href as Route}
                    className="text-muted-foreground hover:text-primary block duration-150"
                  >
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex items-center justify-around w-full border-t py-6">
          <small className="text-muted-foreground block text-center text-sm">
            © {new Date().getFullYear()} Copyright COMSATS University Islamabad.
            All Rights Reserved.
            <br /> Designed & developed by{" "}
            <a
              href="https://github.com/ali1raz"
              target="_blank"
              className="text-primary hover:underline"
            >
              Ali Raza
            </a>
          </small>
        </div>
      </div>
    </footer>
  );
}
