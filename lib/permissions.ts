import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { Role } from "./generated/prisma/enums";

export const statements = {
  ...defaultStatements,
  userProfiles: ["create", "update", "delete", "view"] as const,
  attendance: ["mark", "view"] as const,
  leaveRequest: ["create", "list", "update", "get", "list:past"],
} as const;

export const access = createAccessControl(statements);

export const roles = {
  STUDENT: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: ["view"],
    leaveRequest: ["create", "get"],
  }),

  ADMIN: access.newRole({
    ...defaultStatements,
    ...adminAc.statements,
    userProfiles: ["create", "update", "delete", "view"],
    attendance: ["view"],
    leaveRequest: ["get", "list", "update"],
  }),

  PROFESSOR: access.newRole({
    userProfiles: ["view"],
    user: ["list", "get"],
    session: [],
    attendance: ["view", "mark"],
    leaveRequest: ["get", "list"],
  }),
  ACCOUNTANT: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: [],
    leaveRequest: [],
  }),
  DIRECTOR: access.newRole({
    userProfiles: ["create", "update", "view"],
    user: ["list", "set-role", "get", "update"],
    session: [],
    attendance: ["view"],
    leaveRequest: ["get", "list"],
  }),
  HOD: access.newRole({
    userProfiles: ["view", "update"],
    user: ["list", "get"],
    session: [],
    attendance: ["view"],
    leaveRequest: ["get", "list", "update", "list:past"],
  }),
  USER: access.newRole({
    userProfiles: ["view"],
    user: [],
    session: [],
    attendance: [],
    leaveRequest: [],
  }),
} satisfies Record<Role, ReturnType<typeof access.newRole>>;

export type Statements = typeof statements;

export type PermissionMap = {
  [K in keyof Statements]?: Statements[K][number][];
};
