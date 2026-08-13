import { Request, Response, NextFunction } from "express";
import { validateStaffCredentials, findOrCreateCustomerByPhone } from "./auth.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { logAction } from "../../utils/audit";
import { AuthenticatedRequest } from "../../middleware/authenticate";

const isProd = process.env.COOKIE_SECURE === "true";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

// Staff (Admin, Kitchen) — email + password
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await validateStaffCredentials(email, password);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    setAuthCookies(res, accessToken, refreshToken);

    await logAction(user.id, "STAFF_LOGIN", { email: user.email });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// Customer — phone + name, single step, no password
export async function customerLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, name } = req.body;
    const user = await findOrCreateCustomerByPhone(phone, name);

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    setAuthCookies(res, accessToken, refreshToken);

    await logAction(user.id, "CUSTOMER_LOGIN", { phone: user.phone });

    res.json({
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  if (req.user) {
    await logAction(req.user.id, "USER_LOGOUT", {});
  }
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ message: "Logged out successfully." });
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token provided." });

    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = signRefreshToken({ userId: payload.userId, role: payload.role });
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({ message: "Session refreshed." });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
