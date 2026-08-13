import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthenticatedRequest } from "./authenticate";

/**
 * Role-based route guard.
 * Usage: router.post("/menu", authenticate, authorize("ADMIN"), controller)
 *
 * This is the single source of truth for "who can do what" at the API layer.
 * The frontend also hides/disables UI based on role, but that is UX only —
 * this middleware is what actually enforces access, since a client-side
 * check can always be bypassed by calling the API directly.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: role '${req.user.role}' is not permitted to perform this action.`,
      });
    }

    next();
  };
}
