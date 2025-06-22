import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema({
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'cancel', 'approved', 'rejected', 'completed'],
    default: 'pending',
    required: [true, 'Booking status is a required field.'],
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);
