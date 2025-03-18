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

const pool = createPool();
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.debug("Database connected successfully");
  release();
})

app.use("/api/slots", slotsRouter);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.debug(`Server running on port ${PORT}`);
})

process.on("SIGTERM", () => {
  pool.end(() => {
    console.debug("Database pool has ended");
    process.exit(0);
  })
})