import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import { Role } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

export async function validateStaffCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !user.password) {
    throw new AppError("Invalid email or password.", 401);
  }
  if (user.role === Role.CUSTOMER) {
    throw new AppError("Customers sign in with their phone number, not a password.", 400);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password.", 401);
  }

  return user;
}

/**
 * Customer login/signup in one step: find an existing customer by phone,
 * or create a new one if this is their first time. No password, no OTP —
 * simplified for this assessment (see README for the production note on
 * adding real OTP verification via an SMS provider).
 */
export async function findOrCreateCustomerByPhone(phone: string, name?: string) {
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    if (!existing.isActive) {
      throw new AppError("This account has been deactivated. Contact the restaurant.", 403);
    }
    return existing;
  }

  if (!name) {
    throw new AppError("This phone number isn't registered yet — enter your name to continue.", 400);
  }

  return prisma.user.create({
    data: { name, phone, role: Role.CUSTOMER },
  });
}
