import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, customerLogin, logout, refresh, me } from "./auth.controller";
import { loginSchema, customerLoginSchema } from "./auth.schema";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Staff sign in — Admin, Kitchen
router.post("/login", authLimiter, validate(loginSchema), login);

// Customer sign in / sign up — phone + name, single step
router.post("/customer-login", authLimiter, validate(customerLoginSchema), customerLogin);

router.post("/logout", authenticate, logout);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);

export default router;
