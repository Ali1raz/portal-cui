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
  IconCreditCard,
  IconCreditCardFilled,
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
  BATCH_ADVISOR: {
    title: "Dashboard",
    href: "/batch-advisor",
    icon: IconLayoutDashboard,
    role: "BATCH_ADVISOR",
  },
  CLERK: {
    title: "Dashboard",
    href: "/clerk",
    icon: IconLayoutDashboard,
    role: "CLERK",
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
  ACCOUNTANT: {
    title: "Dashboard",
    href: "/accountant",
    icon: IconLayoutDashboard,
    role: "ACCOUNTANT",
  },
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
    BATCH_ADVISOR: [
      {
        title: "Leave Requests",
        href: "/batch-advisor/leave-requests",
        icon: IconCalendar,
      },
      {
        title: "Complaints",
        href: "/batch-advisor/complaints",
        icon: IconMessageReport,
      },
    ],
    HOD: [
      {
        title: "Dashboard",
        href: "/hod",
        icon: IconLayoutDashboard,
      },
      {
        title: "Manage Fee",
        href: "/hod/fee",
        icon: IconCreditCard,
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
        title: "New Announcement",
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

      {
        title: "Fees",
        href: "/student/fee",
        icon: IconCreditCard,
      },
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
    ACCOUNTANT: [
      {
        title: "Dashboard",
        href: "/accountant",
        icon: IconLayoutDashboard,
      },
      {
        title: "Create Fee",
        href: "/accountant/create-fee",
        icon: IconCreditCard,
      },
      {
        title: "Manage Fee",
        href: "/accountant/manage-fee",
        icon: IconCreditCardFilled,
      },
      {
        title: "Announcements",
        href: "/accountant/announcements",
        icon: IconMessage2,
      },
      {
        title: "New Announcement",
        href: "/accountant/announcements/new",
        icon: IconMessagePlus,
      },
    ],
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
        title: "Semesters",
        href: "/admin/semester",
        icon: IconCalendar,
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
    CLERK: [
      {
        title: "Dashboard",
        href: "/clerk",
        icon: IconLayoutDashboard,
      },
      {
        title: "Applications",
        href: "/clerk/applications",
        icon: IconUsers,
      },
    ],
  } satisfies Record<Role, NavLink<Route>[]>;
  const roleSpecific = roleLinks[userRole] ?? [];

  return [...roleSpecific, ...commonLinks];
}
