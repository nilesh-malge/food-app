import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import menuRoutes from "./modules/menu/menu.routes";
import orderRoutes from "./modules/orders/orders.routes";
import auditRoutes from "./modules/audit/audit.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/audit-logs", auditRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
  });

  app.use(errorHandler);

  return app;
}
