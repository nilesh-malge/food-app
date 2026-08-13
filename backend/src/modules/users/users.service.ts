import bcrypt from "bcrypt";
import { prisma } from "../../config/db";
import { Role } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStaffUser(name: string, email: string, password: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("A user with this email already exists.", 409);

  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export async function setUserActive(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
}

export async function listCustomers(search?: string) {
  return prisma.user.findMany({
    where: {
      role: Role.CUSTOMER,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" },
    take: 20,
  });
}
