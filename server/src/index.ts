import express from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import slotsRouter from "./routes/slots";
dotenv.config();
import { createPool } from "./db";

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

// Connecting and disconnecting data base
export const pool = createPool();
pool.connect((err, _, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.debug("Database connected successfully");
  release();
})

process.on("SIGTERM", () => {
  pool.end(() => {
    console.debug("Database pool has ended");
    process.exit(0);
  })
})

// Connecting API routes
app.use("/api/slots", slotsRouter);

// Starting and shutting down the server
const server = app.listen(process.env.PORT, () => {
  console.debug(`Server running on port ${process.env.PORT}`);
})

const serverShutDown = () => {
  console.debug("Shutting down server...");
  server.close(() => {
    console.debug("Server closed.");
    process.exit(0);
  })
}

setTimeout(serverShutDown, 1000 * 60 * 10);
