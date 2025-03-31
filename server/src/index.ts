import express from "express";
import http from 'http';
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createPool, setupDatabaseListeners } from "./db";
import slotsRouter from "./routes/slots";
import sessionsRouter from "./routes/sessions";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: true },
});
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

// Start server and setup listeners
server.listen(process.env.PORT, async () => {
  try {
    await setupDatabaseListeners();
    console.debug(`Server running on port ${process.env.PORT}`);
  } catch (error) {
    console.error('Server startup error:', error);
  }
});

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  try {
    await pool.end();
    server.close(() => {
      console.debug('Server and database connections closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
