import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { sendNotification } from "../utils/notification.service.js";
import { ApiError } from "../utils/ApiError.js";

const verifySignature = (rawBody, signature, secret) => {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Razorpay webhook. The route mounts express.raw() so req.body is the exact
// bytes we must sign-verify. Nothing is trusted until the HMAC matches.
export const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new ApiError(500, "Payment webhook is not configured");
  }

  const rawBody = req.body; // Buffer
  const signature = req.headers["x-razorpay-signature"];

  if (!verifySignature(rawBody, signature, secret)) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new ApiError(400, "Invalid webhook payload");
  }

  const entity = event?.payload?.payment?.entity ?? {};
  const bookingId = entity?.notes?.bookingId || event?.bookingId;
  if (!bookingId) {
    throw new ApiError(400, "Missing bookingId in webhook payload");
  }

  const statusMap = {
    "payment.captured": "completed",
    "payment.failed": "failed",
  };
  const paymentStatus = statusMap[event.event] || "pending";

  const booking = await Booking.findById(bookingId).populate("user");
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Idempotency: replaying the same event must not re-write or re-notify.
  if (booking.paymentStatus === paymentStatus) {
    return res.status(200).json({ success: true, idempotent: true });
  }

  booking.paymentStatus = paymentStatus;
  await booking.save();

  await sendNotification(req.app.get("io"), {
    receiverId: booking.user._id,
    receiverModel: "User",
    message: `Payment ${paymentStatus} for booking ${booking._id}`,
    type: "payment",
    bookingId: booking._id,
    roomId: booking.room,
  });

  return res.status(200).json({ success: true });
});
