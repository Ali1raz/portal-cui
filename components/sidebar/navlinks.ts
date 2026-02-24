import { Role } from "@/lib/generated/prisma/enums";
import {
  IconBook,
  IconTagPlus,
  IconBooks,
  IconCalendar,
  IconHistory,
  IconHome,
  IconLayoutDashboard,
  IconMessagePlus,
  IconMessageReport,
  IconSchool,
  IconSpeakerphone,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconMessage2,
} from "@tabler/icons-react";
import { Route } from "next";

type NavLink<T extends string = string> = {
  title: string;
  href: T;
  icon: typeof IconHome;
};

type RoleDashboardLink<T extends string = string> = NavLink<T> & {
  role: Role;
};

const roleDashboardLinks: Record<Role, RoleDashboardLink<Route> | null> = {
  PROFESSOR: {
    title: "Dashboard",
    href: "/professor",
    icon: IconLayoutDashboard,
    role: "PROFESSOR",
  },
  HOD: {
    title: "Dashboard",
    href: "/hod",
    icon: IconLayoutDashboard,
    role: "HOD",
  },
  DIRECTOR: {
    title: "Dashboard",
    href: "/director",
    icon: IconLayoutDashboard,
    role: "DIRECTOR",
  },
  STUDENT: {
    title: "Dashboard",
    href: "/student",
    icon: IconSchool,
    role: "STUDENT",
  },
  ADMIN: {
    title: "Dashboard",
    href: "/admin",
    icon: IconLayoutDashboard,
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
      icon: IconUser,
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
        icon: IconLayoutDashboard,
      },
      {
        title: "Subjects",
        href: "/professor/subject",
        icon: IconBook,
      },
    ],
    HOD: [
      {
        title: "Dashboard",
        href: "/hod",
        icon: IconLayoutDashboard,
      },
      {
        title: "Leave Requests",
        href: "/hod/leave-requests",
        icon: IconCalendar,
      },
      {
        title: "Past leave Requests",
        href: "/hod/past-leave-requests",
        icon: IconHistory,
      },
      {
        title: "Complaints",
        href: "/hod/complaints",
        icon: IconMessageReport,
      },
      {
        title: "Announcements",
        href: "/hod/announcements",
        icon: IconMessage2,
      },
      {
        title: "Create Announcement",
        href: "/hod/announcements/new",
        icon: IconMessagePlus,
      },
    ],
    DIRECTOR: [
      {
        title: "Dashboard",
        href: "/director",
        icon: IconLayoutDashboard,
      },
      {
        title: "Users",
        href: "/director/users",
        icon: IconUsers,
      },
    ],
    STUDENT: [
      {
        title: "Dashboard",
        href: "/student",
        icon: IconSchool,
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
        icon: IconCalendar,
      },
      {
        title: "Past leave Requests",
        href: "/student/past-leave-requests",
        icon: IconHistory,
      },
      {
        title: "Complaints",
        href: "/student/complaints",
        icon: IconMessageReport,
      },
      {
        title: "New Complaint",
        href: "/student/complaints/new",
        icon: IconMessagePlus,
      },
      {
        title: "Announcements",
        href: "/student/announcements",
        icon: IconSpeakerphone,
      },
    ],
    ACCOUNTANT: [],
    ADMIN: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: IconLayoutDashboard,
      },
      {
        title: "Subjects",
        href: "/admin/subjects",
        icon: IconBooks,
      },
      {
        title: "Create subject",
        href: "/admin/subjects/create",
        icon: IconTagPlus,
      },
      {
        title: "Offering",
        href: "/admin/offering",
        icon: IconBook,
      },
      {
        title: "Create offering",
        href: "/admin/offering/create",
        icon: IconTagPlus,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: IconUsers,
      },
      {
        title: "Announcements",
        href: "/admin/announcements",
        icon: IconMessage2,
      },
      {
        title: "New Announcement",
        href: "/admin/announcements/new",
        icon: IconMessagePlus,
      },
    ],
    USER: [],
  } satisfies Record<Role, NavLink<Route>[]>;
  const roleSpecific = roleLinks[userRole] ?? [];

  return [...roleSpecific, ...commonLinks];
}
