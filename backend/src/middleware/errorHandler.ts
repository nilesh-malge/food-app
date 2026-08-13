import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.code === "P2002") {
    // Prisma unique constraint violation
    return res.status(409).json({ error: "A record with these details already exists." });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }

  return res.status(500).json({ error: "Something went wrong. Please try again." });
}
