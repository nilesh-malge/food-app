import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import cookie from "cookie";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/db";

let io: Server;

interface AuthedSocket extends Socket {
  data: {
    userId: string;
    role: string;
  };
}

export function initSockets(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same httpOnly JWT cookie
  // used by the REST API. We NEVER trust a client-supplied role — we always
  // re-derive it from the verified token + a DB lookup, then join rooms
  // based on that server-verified role.
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized: no session cookie"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.accessToken;
      if (!token) return next(new Error("Unauthorized: no access token"));

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!user || !user.isActive)
        return next(new Error("Unauthorized: invalid user"));

      (socket as AuthedSocket).data.userId = user.id;
      (socket as AuthedSocket).data.role = user.role;
      next();
    } catch (err) {
      next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const { userId, role } = (socket as AuthedSocket).data;

    // Room membership is decided server-side from the verified role only
    if (role === "KITCHEN" || role === "ADMIN") {
      socket.join("kitchen");
    }
    if (role === "ADMIN") {
      socket.join("admin");
    }
    // Every user (including admin, for orders placed on their behalf) gets
    // their own private room to receive updates about their own orders.
    socket.join(`customer:${userId}`);

    socket.on("disconnect", () => {
      // no-op; socket.io cleans up room membership automatically
    });
  });

  return io;
}

export function getIO(): Server | null {
  return io ?? null;
}
