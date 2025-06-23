import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfim: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.passwordConfim, {
  message: "Passwords don't match",
  path: ["passwordConfim"],
});