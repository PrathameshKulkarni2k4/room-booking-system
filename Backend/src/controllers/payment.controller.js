import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { sendNotification } from "../utils/notification.service.js";

export const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const { bookingId, status } = req.body;
  
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { paymentStatus: status },
    { new: true }
  ).populate('user');

  await sendNotification({
    userId: booking.user._id,
    message: `Payment ${status} for booking ${booking._id}`,
    type: 'payment',
    bookingId: booking._id
  });

  res.status(200).json({ success: true });
});