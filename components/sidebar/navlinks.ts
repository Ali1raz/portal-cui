import { Role } from "@/lib/generated/prisma/enums";
import {
  IconBook,
  IconBook2,
  IconBooks,
  IconHome,
  IconPlus,
  IconUserCheck,
} from "@tabler/icons-react";
import { GraduationCap, Home, User, Users } from "lucide-react";
import { Route } from "next";

type NavLink<T extends string = string> = {
  title: string;
  href: T;
  icon: typeof Home | typeof IconUserCheck;
};

type RoleDashboardLink<T extends string = string> = NavLink<T> & {
  role: Role;
};

const roleDashboardLinks: Record<Role, RoleDashboardLink<Route> | null> = {
  PROFESSOR: {
    title: "Dashboard",
    href: "/professor",
    icon: IconHome,
    role: "PROFESSOR",
  },
  HOD: {
    title: "Dashboard",
    href: "/hod",
    icon: Home,
    role: "HOD",
  },
  DIRECTOR: {
    title: "Dashboard",
    href: "/director",
    icon: Home,
    role: "DIRECTOR",
  },
  STUDENT: {
    title: "Dashboard",
    href: "/student",
    icon: GraduationCap,
    role: "STUDENT",
  },
  ADMIN: {
    title: "Dashboard",
    href: "/admin",
    icon: IconHome,
    role: "ADMIN",
  },
  ACCOUNTANT: null,
  USER: null,
};

/// Returns a role-based dashboard link when available.
export function getDashboardLinkForRole(
  userRole: Role | null | undefined
): RoleDashboardLink<Route> | null {
  if (!userRole) {
    return null;
  }

  return roleDashboardLinks[userRole] ?? null;
}

/// Returns links for sidebar based on user role
export function getNavLinks({
  userRole,
}: {
  userRole: Role | null | undefined;
}): NavLink<Route>[] {
  const commonLinks: NavLink<Route>[] = [
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  if (!userRole) {
    return commonLinks;
  }

  const roleLinks: Record<Role, NavLink<Route>[]> = {
    PROFESSOR: [
      {
        title: "Dashboard",
        href: "/professor",
        icon: IconHome,
      },
      {
        title: "Sections",
        href: "/professor/sections",
        icon: Users,
      },
    ],
    HOD: [
      {
        title: "Dashboard",
        href: "/hod",
        icon: Home,
      },
      {
        title: "Leave Requests",
        href: "/hod/leave-requests",
        icon: Users,
      },
      {
        title: "Past leave Requests",
        href: "/hod/past-leave-requests",
        icon: Users,
      },
    ],
    DIRECTOR: [
      {
        title: "Dashboard",
        href: "/director",
        icon: Home,
      },
      {
        title: "Users",
        href: "/director/users",
        icon: Users,
      },
    ],
    STUDENT: [
      {
        title: "Dashboard",
        href: "/student",
        icon: GraduationCap,
      },
      {
        title: "Registration",
        href: "/student/registration",
        icon: IconUserCheck,
      },

      // {
      //   title: "Fees",
      //   href: "/student/fee",
      //   icon: IconCreditCard,
      // },
      // {
      //   title: "Result card",
      //   href: "/student/result",
      //   icon: GraduationCap,
      // },
      {
        title: "Request leave",
        href: "/student/request-leave",
        icon: IconUserCheck,
      },
      {
        title: "Past leave Requests",
        href: "/student/past-leave-requests",
        icon: IconUserCheck,
      },
    ],
    ACCOUNTANT: [],
    ADMIN: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: IconHome,
      },
      {
        title: "Subjects",
        href: "/admin/subjects",
        icon: IconBooks,
      },
      {
        title: "Create subject",
        href: "/admin/subjects/create",
        icon: IconPlus,
      },
      {
        title: "Offering",
        href: "/admin/offering",
        icon: IconBook,
      },
      {
        title: "Create offering",
        href: "/admin/offering/create",
        icon: IconBook2,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
    ],
    USER: [],
  };
  const roleSpecific = roleLinks[userRole] ?? [];

  return [...roleSpecific, ...commonLinks];
}
