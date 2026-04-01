import { Role } from "@/lib/generated/prisma/enums";
import { Route } from "next";

const ROLE_DASHBOARD_REDIRECTS: Record<Role, Route | null> = {
  PROFESSOR: "/professor",
  BATCH_ADVISOR: "/batch-advisor",
  CLERK: "/clerk",
  HOD: "/hod",
  DIRECTOR: "/director",
  STUDENT: "/student",
  ADMIN: "/admin",
  ACCOUNTANT: "/accountant",
  USER: null,
};

export function getDashboardRedirectPath(role: Role | null | undefined): Route {
  if (!role) {
    return "/";
  }

  return ROLE_DASHBOARD_REDIRECTS[role] ?? "/";
}
