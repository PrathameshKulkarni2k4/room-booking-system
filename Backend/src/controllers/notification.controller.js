import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const receiverId = req.user._id;

  const notification = await Notification.findById(notificationId)
    .populate("booking room");

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (
    notification.receiver.toString() !== receiverId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to view this notification");
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification fetched successfully")
  );
});

const markRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId)

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  // Optional: mark as read
  if (!notification.read) {
    notification.read = true;
    await notification.save();
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked read")
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const receiverId = req.user._id;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (
    notification.receiver.toString() !== receiverId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this notification");
  }

  await notification.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Notification deleted successfully")
  );
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  const receiverId = req.user._id;

  const deleted = await Notification.deleteMany({ receiver: receiverId });

  return res.status(200).json(
    new ApiResponse(200, { deletedCount: deleted.deletedCount }, "All notifications cleared successfully")
  );
});


export {
  getNotification,
  markRead,
  deleteNotification,
  clearAllNotifications
}
