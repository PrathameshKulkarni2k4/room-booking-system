import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { Room } from "../models/room.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendNotification } from "../utils/notification.service.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";

const createBooking = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id;

  const room = await Room.findById(roomId).populate("owner");
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  // Prevent the same user holding more than one active request for a room.
  const existingUserBooking = await Booking.findOne({
    room: roomId,
    user: userId,
    status: { $in: ["pending", "approved"] },
  });
  if (existingUserBooking) {
    throw new ApiError(409, "You already have an active request for this room");
  }

  // Atomic reservation: flip Available -> Reserved in a single conditional
  // update so two concurrent requests can never both succeed.
  const reserved = await Room.findOneAndUpdate(
    { _id: roomId, status: "Available" },
    { $set: { status: "Reserved" } },
    { new: true }
  );
  if (!reserved) {
    throw new ApiError(409, "Room is no longer available");
  }

  let booking;
  try {
    booking = await Booking.create({
      user: userId,
      room: roomId,
      status: "pending",
    });
  } catch (error) {
    // release the reservation if the booking could not be created
    await Room.findByIdAndUpdate(roomId, { $set: { status: "Available" } });
    throw error;
  }

  await sendNotification(req.app.get("io"), {
    receiverId: room.owner._id,
    receiverModel: "Owner",
    message: `New booking request for ${room.name}`,
    type: "booking",
    bookingId: booking._id,
    roomId: room._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, booking, "Booking request created"));
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status, notificationId } = req.body;

  const allowed = ["approved", "rejected", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowed.join(", ")}`);
  }

  const booking = await Booking.findById(bookingId).populate(
    "user",
    "username fullName email"
  );
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Ownership: the booking's room must belong to the requesting owner.
  const room = await Room.findById(booking.room);
  if (!room || !room.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not allowed to manage this booking");
  }

  booking.status = status;
  await booking.save();

  if (notificationId) {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  }

  if (status === "approved") {
    await Room.findByIdAndUpdate(room._id, { $set: { status: "Booked" } });
    // Reject every other pending request for this room.
    await Booking.updateMany(
      { room: room._id, _id: { $ne: booking._id }, status: "pending" },
      { $set: { status: "rejected" } }
    );
  }

  if (status === "rejected" || status === "cancelled") {
    await Room.findByIdAndUpdate(room._id, { $set: { status: "Available" } });
  }

  await sendNotification(req.app.get("io"), {
    receiverId: booking.user._id,
    receiverModel: "User",
    message: `Your booking has been ${status}`,
    type: "booking-status",
    bookingId: booking._id,
    roomId: booking.room,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking status updated"));
});

const getUserBookedRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({
    user: userId,
    status: "approved",
  }).populate({
    path: "room",
    populate: { path: "owner", select: "username fullName email phoneNo" },
  });

  // An empty list is a valid result, not an error.
  const bookedRooms = bookings.map((booking) => booking.room).filter(Boolean);

  return res
    .status(200)
    .json(
      new ApiResponse(200, bookedRooms, "Booked rooms fetched successfully")
    );
});

const checkUserBookedRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;

  const booking = await Booking.findOne({
    user: userId,
    room: roomId,
    status: "approved",
  });

  const booked = !!booking;
  return res
    .status(200)
    .json(new ApiResponse(200, { booked }, "Booking status fetched"));
});

const unbookRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;

  const booking = await Booking.findOneAndUpdate(
    { user: userId, room: roomId, status: "approved" },
    { $set: { status: "cancelled" } },
    { new: true }
  ).populate("room");

  if (!booking) {
    throw new ApiError(404, "No approved booking found to cancel");
  }

  await Room.findByIdAndUpdate(booking.room._id, {
    $set: { status: "Available" },
  });

  await sendNotification(req.app.get("io"), {
    receiverId: booking.room.owner,
    receiverModel: "Owner",
    message: `Booking for your room "${booking.room.name}" has been cancelled`,
    type: "booking-status",
    bookingId: booking._id,
    roomId: booking.room._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Booking cancelled and owner notified")
    );
});

export {
  createBooking,
  updateBookingStatus,
  getUserBookedRooms,
  checkUserBookedRoom,
  unbookRoom,
};
