import { Department, Program, Role } from "@/lib/generated/prisma/enums";
import { ASSIGNABLE_ROLES } from "@/lib/utils";
import { z } from "zod";

export const changeUserRoleSchema = z
  .object({
    role: z
      .enum(Role)
      .refine((role) => (ASSIGNABLE_ROLES as Role[]).includes(role), {
        message: "Batch Advisor and Student roles are not assignable here.",
      }),
    professorDepartment: z.enum(Department).optional(),
    professorPrograms: z.array(z.enum(Program)).default([]),
    hodDepartment: z.enum(Department).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.role === Role.PROFESSOR) {
      if (!values.professorDepartment) {
        ctx.addIssue({
          code: "custom",
          path: ["professorDepartment"],
          message: "Department is required for professors.",
        });
      }

      if (!values.professorPrograms.length) {
        ctx.addIssue({
          code: "custom",
          path: ["professorPrograms"],
          message: "Select at least one program for the professor.",
        });
      }
    }

    if (values.role === Role.HOD) {
      if (!values.hodDepartment) {
        ctx.addIssue({
          code: "custom",
          path: ["hodDepartment"],
          message: "Department is required for HODs.",
        });
      }
    }
  });

export type ChangeUserRoleFormValues = z.infer<typeof changeUserRoleSchema>;

export type ChangeUserRolePayload = {
  role: Role;
  professorDepartment?: Department;
  professorPrograms?: Program[];
  hodDepartment?: Department;
};

export type ChangeUserRoleTarget = {
  id: string;
  name: string | null;
  role: Role;
  professor?: {
    department: Department | null;
    programs: Program[];
  } | null;
  hod?: {
    department: Department | null;
  } | null;
};
