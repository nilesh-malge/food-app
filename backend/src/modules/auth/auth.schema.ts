import { z } from "zod";

// Staff login only (Admin, Kitchen) — email + password
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Customer login/signup — just name + phone, no password.
// `name` is required only the first time (new account); an existing
// customer signing in again only needs their phone number.
export const customerLoginSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
  }),
});
