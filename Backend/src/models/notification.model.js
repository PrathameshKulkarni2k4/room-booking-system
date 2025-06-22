import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  receiver: {
    type: Schema.Types.ObjectId,
    refPath: 'receiverModel',
    required: true
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Owner'] // Supports both User and Owner models
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['payment', 'booking', 'booking-status', 'alert', 'system'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking"
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room"
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ✅ Correct index field to match the schema
notificationSchema.index({ receiver: 1, read: 1, createdAt: -1 });

export const Notification = model("Notification", notificationSchema);
