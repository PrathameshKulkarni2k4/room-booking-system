import { Notification } from "../models/notification.model.js";

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-user-room', (roomId) => {
      socket.join(`${roomId}`);
      console.log(`${roomId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};




export {
    initializeSocket,
}