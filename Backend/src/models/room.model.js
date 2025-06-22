import mongoose, { Schema } from "mongoose";


const feedbackSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false
});

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["Available", "Booked"],
    default: "Available",
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  facilities: {
    type: [String],
    enum: [
      "Wi-Fi",
      "Hot Water",
      "Kitchen",
      "Parking",
      "Attach Bathroom",
      "Balcony",
      "Bed",
      "Chair",
      "Desk",
      "Wardrobe"
    ],
    default: []
  },
  images: {
    type: [String], // Array of image URLs or filenames
    required: true,
  },
  feedback: [feedbackSchema],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
}, {
  timestamps: true,
});

roomSchema.index({ location: "2dsphere" });

export const Room = mongoose.model("Room", roomSchema);

