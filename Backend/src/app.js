import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./utils/socket.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();

// First-party origins that must always be allowed, even if the environment
// variable is missing or stale.
const DEFAULT_ALLOWED_ORIGINS = ["https://roombuddyforstudent.vercel.app"];

// CORS: accept a comma-separated allow-list (CORS_ORIGINS) while remaining
// backwards compatible with the single-origin CORS_ORIGIN variable. The
// defaults above are merged in so a stale env var cannot lock out the
// deployed frontend.
const configuredOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CORS_ORIGIN ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...configuredOrigins, ...DEFAULT_ALLOWED_ORIGINS]),
];

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

// The payment webhook must receive the RAW body so its HMAC signature can be
// verified. This MUST be mounted before express.json(), which would otherwise
// consume and re-serialise the payload and break the signature check.
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "16kb" })); // Set a limit for JSON body size
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Set a limit for URL-encoded body size
app.use(express.static("public")); // Serve static files from 'public' directory
app.use(cookieParser()); // Parse cookies

// Create the HTTP server
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN, // Allow frontend from this origin
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize socket events
initializeSocket(io);
app.set("io", io);

// Import routes
import userRouter from "./routes/user.route.js";
import roomRouter from "./routes/room.route.js";
import ownerRouter from "./routes/owner.route.js";
import verificationRouter from "./routes/verification.route.js";
import bookingRouter from "./routes/booking.route.js";
import paymentRouter from "./routes/payment.route.js";

// Use the imported routes for specific API paths
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/owner", ownerRouter);
app.use("/api/v1/verify", verificationRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/payments", paymentRouter);

// Liveness/health probe for uptime monitoring (UptimeRobot, Render health checks).
app.get("/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  return res.status(dbUp ? 200 : 503).json({
    status: dbUp ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (should be the last middleware)
app.use(errorHandler);

// Export the app and server for use in other modules (e.g., for testing or integration)
export { app, httpServer };
