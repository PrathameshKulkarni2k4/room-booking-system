import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { Room } from '../models/room.model.js';
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendNotification } from "../utils/notification.service.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";

const createBooking = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user._id;

    // 1. Check if the room is already booked by another user (approved status)
    const existingBooking = await Booking.findOne({
        room: roomId,
        status: "approved",
    });

    if (existingBooking) {
        // Prevent duplicate booking if someone else has already booked
        if (!existingBooking.user.equals(userId)) {
            throw new ApiError(401, "Room is already booked by another user")
        } else {
            throw new ApiError(402, "You have already booked this room")
        }
    }

    // 2. Create new booking
    const booking = await Booking.create({
        user: userId,
        room: roomId,
        status: "pending",
    });

    // 3. Fetch room details to get owner
    const room = await Room.findById(roomId).populate('owner');

    // 4. Send notification to the room owner
    await sendNotification(req.app.get('io'), {
        receiverId: room.owner._id,
        receiverModel: "Owner",
        message: `New booking request for ${room.name}`,
        type: "booking",
        bookingId: booking._id,
        roomId: room._id
    });

    return res.status(200).json(
        new ApiResponse(200, booking, "Room booked successfully")
    );
});


const updateBookingStatus = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { status, notificationId } = req.body;

    const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
    ).populate('user', 'name email');

    await Notification.findByIdAndUpdate(notificationId, { read: true });


    if ( status === 'approved') {
        await Room.findByIdAndUpdate(booking.room, { status: "Booked"});
    }

    // 1. Send notification to the user
    await sendNotification(req.app.get('io'), {
        receiverId: booking.user._id,
        receiverModel: "User",
        message: `Your booking has been ${status}`,
        type: "booking-status",
        bookingId: booking._id,
        roomId: booking.room
    });

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking status has changed")
    )
});

const getUserBookedRooms = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Find bookings with status 'approved'
    const bookings = await Booking.find({ 
        user: userId,
        status: "approved"
    }).populate({
        path: "room",
        populate: {
            path: "owner",
            select: "username email"
        }
    });

    // 2. Check if any approved bookings exist
    if (!bookings || bookings.length === 0) {
        throw new ApiError(404, "booking not found")
    }

    // 3. Extract room data
    const bookedRooms = bookings.map((booking) => booking.room);

    // 4. Return only approved rooms
    return res.status(200).json(
        new ApiResponse(200, bookedRooms, "Approved booked rooms fetched successfully")
    );
});

const checkUserBookedRoom = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const roomId = req.params.roomId;

    // Check if booking exists and is approved
    const booking = await Booking.findOne({
        user: userId,
        room: roomId,
        status: "approved"
    });

    const booked = !!booking; // true if booking exists
    return res.status(200).json(new ApiResponse(200, { booked }, "Booking status fetched"));
});


const unbookRoom = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const roomId = req.params.roomId;

  // 1. Find and cancel booking in one operation
  const booking = await Booking.findOneAndUpdate(
    {
      user: userId,
      room: roomId,
      status: "approved",
    },
    { $set: { status: "cancel" } },
    { new: true }
  ).populate("room"); // populate to access room.owner

  if (!booking) {
    throw new ApiError(404, "No approved booking found to cancel.");
  }

  // 2. Update room status to 'Available'
  await Room.findByIdAndUpdate(booking.room._id, {
    status: "Available",
  });

  // 3. Send notification to the owner
  await sendNotification(req.app.get("io"), {
    receiverId: booking.room.owner,
    receiverModel: "Owner",
    message: `Booking for your room "${booking.room.name}" has been cancelled.`,
    type: "booking-status",
    bookingId: booking._id,
    roomId: booking.room._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Room unbooked and owner notified"));
});

export {
    createBooking,
    updateBookingStatus,
    getUserBookedRooms,
    checkUserBookedRoom,
    unbookRoom
};
