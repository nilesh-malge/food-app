import "dotenv/config";
import http from "http";
import { createApp } from "./app";
import { initSockets } from "./sockets";

const PORT = process.env.PORT || 4000;

const app = createApp();
const httpServer = http.createServer(app);

initSockets(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🍽  Backend running on http://localhost:${PORT}`);
});
