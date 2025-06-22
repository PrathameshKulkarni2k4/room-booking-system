import { Notification } from "../models/notification.model.js";

export const sendNotification = async (io, {
  receiverId,
  receiverModel,
  message,
  type,
  bookingId,
  roomId
}) => {
  const notification = await Notification.create({
    receiver: receiverId,
    receiverModel,
    message,
    type,
    booking: bookingId,
    room: roomId,
    read: false
  });

  console.log(`🔔 Notification sent to ${receiverModel}-${receiverId}`);

  io.to(`${receiverModel}-${receiverId}`).emit('new-notification', notification);

  return notification;
};
