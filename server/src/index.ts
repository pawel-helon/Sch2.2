import express from "express";
import http from "http";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createPool, setupDatabaseListeners } from "./db";
import slotsRouter from "./routes/slots";
import sessionsRouter from "./routes/sessions";
import { getTestDates } from "./lib/helpers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

// Connect database
export const pool = createPool();
pool.connect((err, _, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.debug("Database connected successfully");
  release();
});

// Connect API routes
app.use("/api/slots", slotsRouter);
app.use("/api/sessions", sessionsRouter)

// Listen to api routes
app.listen(process.env.API_ROUTES_PORT, () => {
  try {
    console.debug(`Listening to api routes running on port ${process.env.API_ROUTES_PORT}`);
  } catch (error) {
    console.error("Listening to api routes startup error: ", error);
  }
});

// Listen to streamed database changes
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: true },
});
server.listen(process.env.STREAMING_PORT, async () => {
  try {
    await setupDatabaseListeners();
    console.debug(`Streaming database changes running on port ${process.env.STREAMING_PORT}`);
  } catch (error) {
    console.error("Streaming database changes startup error: ", error);
  }
});

// Cleanup on shutdown
process.on("SIGTERM", async () => {
  try {
    await pool.end();
    server.close(() => {
      console.debug("Server and database connections closed");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
