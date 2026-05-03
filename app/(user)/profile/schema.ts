import z from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be 3 chars long." })
    .max(20, { message: "Name must be less than 20 chars." }),
  imageKey: z.string().optional(),
});
export type UpdateProfileType = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password must be at least 8 characters." }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordType = z.infer<typeof changePasswordSchema>;
