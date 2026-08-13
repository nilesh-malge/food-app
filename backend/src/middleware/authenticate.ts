import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/db";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email: string | null;
    phone: string | null;
    name: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Not authenticated. Please log in." });
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ error: "Account not found or deactivated." });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name,
    };
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Invalid or expired session. Please log in again." });
  }
}
