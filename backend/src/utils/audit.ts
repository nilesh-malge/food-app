import { prisma } from "../config/db";

export async function logAction(userId: string, action: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.auditLog.create({
      data: { userId, action, metadata: metadata as any },
    });
  } catch (err) {
    // Audit logging must never break the primary request flow
    console.error("Failed to write audit log:", err);
  }
}
