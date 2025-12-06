import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Not a valid email." }),
  password: z.string().min(8, { message: "Password should be 8 chars long." }),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be 3 chars long" }),
  email: z.string().email({ message: "Not a valid email." }),
  password: z.string().min(8, { message: "Password should be 8 chars long." }),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
