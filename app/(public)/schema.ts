import z from "zod";
import { Department, Gender } from "@/lib/generated/prisma/enums";

const currentYear = new Date().getFullYear();

export const applyFormSchema = z.object({
  semesterId: z.string().min(1, { message: "Please select a department." }),
  fullName: z.string().min(3, { message: "Full name is required." }),
  dateOfBirth: z.date({ message: "Date of birth is required." }),
  gender: z.enum(Gender, {
    message: "Please select a gender.",
  }),
  address: z.string().min(5, { message: "Address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  phoneNo: z.string().min(7, { message: "Phone number is required." }),
  preferredDepartment: z.enum(Department, {
    message: "Please select a department.",
  }),
  previousDegree: z
    .string()
    .min(3, { message: "Previous degree is required." }),
  previousInstitution: z
    .string()
    .min(3, { message: "Previous institution is required." }),
  previousPassingYear: z
    .number()
    .int()
    .min(1980, { message: "Passing year is not valid." })
    .max(currentYear, { message: "Passing year cannot be in the future." }),
  previousPercentage: z
    .number()
    .min(0, { message: "Percentage cannot be negative." })
    .max(100, { message: "Percentage cannot be greater than 100." }),
});

export type ApplyFormSchemaType = z.infer<typeof applyFormSchema>;
