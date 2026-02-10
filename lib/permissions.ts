import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { Role } from "./generated/prisma/enums";

export const statements = {
  ...defaultStatements,
  userProfiles: ["create", "update", "delete", "view"] as const,
  attendance: ["mark", "view"] as const,
  leaveRequest: ["create", "list", "update", "get", "list:past"] as const,
  subject: ["create", "list", "get", "update", "delete"] as const,
  subjectOfferings: ["create", "list", "get", "update", "delete"] as const,
} as const;

export const access = createAccessControl(statements);

export const roles = {
  STUDENT: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: ["view"],
    leaveRequest: ["create", "get", "list", "list:past"],
    subject: ["list"],
    subjectOfferings: ["list"],
  }),

  ADMIN: access.newRole({
    ...defaultStatements,
    ...adminAc.statements,
    userProfiles: ["create", "update", "delete", "view"],
    attendance: ["view"],
    leaveRequest: ["get", "list", "update", "list:past"],
    subject: ["create", "get", "list", "update", "delete"],
    subjectOfferings: ["list", "get", "update", "delete", "create"],
  }),

  PROFESSOR: access.newRole({
    userProfiles: ["view"],
    user: ["list", "get"],
    session: [],
    attendance: ["view", "mark"],
    leaveRequest: ["get", "list", "list:past"],
    subject: ["list", "get"],
    subjectOfferings: ["list"],
  }),
  ACCOUNTANT: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: [],
    leaveRequest: [],
    subject: ["list"],
    subjectOfferings: ["list"],
  }),
  DIRECTOR: access.newRole({
    userProfiles: ["create", "update", "view"],
    user: ["list", "set-role", "get", "update"],
    session: [],
    attendance: ["view"],
    leaveRequest: ["get", "list", "list:past"],
    subject: ["list", "get"],
    subjectOfferings: ["list", "get", "update"],
  }),
  HOD: access.newRole({
    userProfiles: ["view", "update"],
    user: ["list", "get"],
    session: [],
    attendance: ["view"],
    leaveRequest: ["get", "list", "update", "list:past"],
    subject: ["list", "get", "update"],
    subjectOfferings: ["list", "get"],
  }),
  USER: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: [],
    leaveRequest: [],
    subject: [],
    subjectOfferings: [],
  }),
} satisfies Record<Role, ReturnType<typeof access.newRole>>;

export type Statements = typeof statements;

export type PermissionMap = {
  [K in keyof Statements]?: Statements[K][number][];
};
