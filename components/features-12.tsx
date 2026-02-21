"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LayoutDashboard,
  MessageSquareWarning,
  ClipboardList,
  Megaphone,
  ShieldCheck,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type FeatureId =
  | "student-dashboard"
  | "student-complaints"
  | "professor-attendance"
  | "hod-announcements"
  | "hod-complaints"
  | "hod-leave-requests";

type Role = "Student" | "Professor" | "HOD";

interface Feature {
  id: FeatureId;
  label: string;
  description: string;
  icon: LucideIcon;
  role: Role;
  screenshots: {
    light: string;
    dark: string;
  };
}

const features: Feature[] = [
  {
    id: "student-dashboard",
    label: "Dashboard",
    description:
      "View enrolled subjects with real-time attendance percentages and department announcements at a glance.",
    icon: LayoutDashboard,
    role: "Student",
    screenshots: {
      light: "/features/st-dab-light.png",
      dark: "/features/st-dab-dark.png",
    },
  },
  {
    id: "student-complaints",
    label: "Complaints",
    description:
      "Submit complaints directly to your department HOD and track resolution status in real time.",
    icon: MessageSquareWarning,
    role: "Student",
    screenshots: {
      light: "/features/st-comp-table-light.png",
      dark: "/features/st-comp-table-dark.png",
    },
  },
  {
    id: "professor-attendance",
    label: "Attendance Management",
    description:
      "Mark and manage student attendance, with leave request alerts surfaced inline so adjustments stay accurate.",
    icon: ClipboardList,
    role: "Professor",
    screenshots: {
      light: "/features/prof-att-table-light.png",
      dark: "/features/prof-att-table-dark.png",
    },
  },
  {
    id: "hod-announcements",
    label: "Announcements",
    description:
      "Publish and manage department-wide announcements, visible to all enrolled students instantly.",
    icon: Megaphone,
    role: "HOD",
    screenshots: {
      light: "/features/hod-ann-table-light.png",
      dark: "/features/hod-ann-table-dark.png",
    },
  },
  {
    id: "hod-complaints",
    label: "Complaint Review",
    description:
      "Review and resolve student complaints, update statuses, and automatically notify students of outcomes.",
    icon: ShieldCheck,
    role: "HOD",
    screenshots: {
      light: "/features/hod-comp-table-light.png",
      dark: "/features/hod-comp-table-dark.png",
    },
  },
  {
    id: "hod-leave-requests",
    label: "Leave Requests",
    description:
      "Approve or reject student leave requests with full context, keeping attendance records consistent.",
    icon: CalendarCheck,
    role: "HOD",
    screenshots: {
      light: "/features/hod-lr-table-light.png",
      dark: "/features/hod-lr-table-dark.png",
    },
  },
];

const roleOrder: Role[] = ["Student", "Professor", "HOD"];

export function Features() {
  const [activeId, setActiveId] = useState<FeatureId>("student-dashboard");

  const activeFeature = features.find((f) => f.id === activeId)!;

  const grouped = roleOrder.reduce<Record<Role, Feature[]>>(
    (acc, role) => {
      acc[role] = features.filter((f) => f.role === role);
      return acc;
    },
    { Student: [], Professor: [], HOD: [] }
  );

  return (
    <section className="py-12 md:py-20 lg:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
        {/* Header */}
        <div className="relative z-10 mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-6xl">
            Built for every role
          </h2>
          <p className="text-muted-foreground">
            From students tracking attendance to HODs resolving complaints —
            every role gets a tailored experience designed to reduce friction
            and keep everyone informed.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
          {/* Accordion */}
          <Accordion
            type="single"
            value={activeId}
            onValueChange={(value) => setActiveId(value as FeatureId)}
            className="w-full"
          >
            {roleOrder.map((role) => (
              <div key={role} className="mb-2">
                {/* Role group label
                <div className="mb-1 px-1 pb-1 pt-3 first:pt-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeStyles[role]}`}
                  >
                    {role}
                  </span>
                </div> */}
                {grouped[role].map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <AccordionItem key={feature.id} value={feature.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2.5  font-medium">
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          {feature.label}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {feature.description}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </div>
            ))}
          </Accordion>

          {/* Screenshot panel */}
          <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
            <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]" />
            <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md"
                >
                  {/* Light mode */}
                  <Image
                    src={activeFeature.screenshots.light}
                    className="size-full object-cover object-top-left dark:hidden"
                    alt={activeFeature.label}
                    width={1207}
                    height={929}
                    priority
                  />
                  {/* Dark mode */}
                  <Image
                    src={activeFeature.screenshots.dark}
                    className="hidden size-full object-cover object-top-left dark:block"
                    alt={activeFeature.label}
                    width={1207}
                    height={929}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
