import { Batch, Department } from "@/lib/generated/prisma/enums";
import { z } from "zod";

export const createSemesterSchema = z
  .object({
    semester: z
      .number()
      .int()
      .min(1, { message: "Semester must be at least 1." })
      .max(12, { message: "Semester must be less than or equal to 12." }),
    year: z
      .number()
      .int()
      .min(2000, { message: "Year must be valid." })
      .max(2100, { message: "Year must be valid." }),
    department: z.enum(Department, {
      message: "Department is required.",
    }),
    batch: z.enum(Batch, {
      message: "Batch is required.",
    }),
    startDate: z.date({ message: "Semester start date is required." }),
    endDate: z.date({ message: "Semester end date is required." }),
    registrationStart: z.date({ message: "Registration start is required." }),
    registrationEnd: z.date({ message: "Registration end is required." }),
    enrollmentStart: z.date({ message: "Enrollment start is required." }),
    enrollmentEnd: z.date({ message: "Enrollment end is required." }),
    addDeadline: z.date({ message: "Add deadline is required." }),
    dropDeadline: z.date({ message: "Drop deadline is required." }),
    lateDropDeadline: z.date({ message: "Late drop deadline is required." }),
    isActive: z.boolean().default(false),
  })
  .superRefine((values, context) => {
    if (values.endDate <= values.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Semester end date must be after semester start date.",
        path: ["endDate"],
      });
    }

    if (values.registrationEnd > values.endDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registration end must be on/before semester end date.",
        path: ["registrationEnd"],
      });
    }

    if (values.registrationEnd <= values.registrationStart) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registration end must be after registration start.",
        path: ["registrationEnd"],
      });
    }

    if (values.enrollmentEnd <= values.enrollmentStart) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enrollment end must be after enrollment start.",
        path: ["enrollmentEnd"],
      });
    }

    if (values.addDeadline > values.enrollmentEnd) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add deadline must be on/before enrollment end.",
        path: ["addDeadline"],
      });
    }

    if (values.dropDeadline < values.addDeadline) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Drop deadline must be on/after add deadline.",
        path: ["dropDeadline"],
      });
    }

    if (values.lateDropDeadline < values.dropDeadline) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Late drop deadline must be on/after drop deadline.",
        path: ["lateDropDeadline"],
      });
    }
  });

export type CreateSemesterSchemaInputType = z.input<
  typeof createSemesterSchema
>;
