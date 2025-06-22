import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/errorHandler.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./utils/socket.js";
import dotenv from "dotenv";

dotenv.config({ path: './.env' });

const app = express();

// Middleware setup
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

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
    credentials: true
  }
});

// Initialize socket events
initializeSocket(io);
app.set('io', io);

// Import routes
import userRouter from './routes/user.route.js';
import roomRouter from './routes/room.route.js';
import ownerRouter from './routes/owner.route.js';
import verificationRouter from './routes/verification.route.js';
import bookingRouter from './routes/booking.route.js';
import paymentRouter from './routes/payment.route.js';

// Use the imported routes for specific API paths
app.use("/api/v1/users", userRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/owner", ownerRouter);
app.use("/api/v1/verify", verificationRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/payments", paymentRouter);

// Error handling middleware (should be the last middleware)
app.use(errorHandler);

// Export the app and server for use in other modules (e.g., for testing or integration)
export { app, httpServer };
