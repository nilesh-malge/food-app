import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { getUsers, createStaff, toggleActive, searchCustomers } from "./users.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

const router = Router();

const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.nativeEnum(Role).refine((r) => r !== Role.CUSTOMER, {
      message: "Use the public registration endpoint for customer accounts.",
    }),
  }),
});

const toggleActiveSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  params: z.object({ id: z.string().uuid() }),
});

// Every route below is Admin-only — staff & role management is the most
// sensitive surface in an RBAC app, so it gets the strictest guard.
router.use(authenticate);

router.get("/", authorize("ADMIN"), getUsers);
router.get("/customers/search", authorize("ADMIN"), searchCustomers);
router.post("/staff", authorize("ADMIN"), validate(createStaffSchema), createStaff);
router.patch("/:id/active", authorize("ADMIN"), validate(toggleActiveSchema), toggleActive);

export default router;
