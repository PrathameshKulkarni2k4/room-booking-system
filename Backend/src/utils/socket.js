import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Owner } from "../models/owner.model.js";

const initializeSocket = (io) => {
  // Authenticate every connection BEFORE it is allowed to join a room.
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      let account = await User.findById(decoded?._id).select("_id");
      let receiverModel = "User";
      if (!account) {
        account = await Owner.findById(decoded?._id).select("_id");
        receiverModel = "Owner";
      }
      if (!account) {
        return next(new Error("Invalid token"));
      }

      socket.data.accountId = account._id.toString();
      socket.data.receiverModel = receiverModel;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { accountId, receiverModel } = socket.data;

    // The SERVER decides which room the socket joins — a client can never
    // subscribe to another account's notification stream.
    const room = `${receiverModel}-${accountId}`;
    socket.join(room);
    console.log(`${room} joined socket: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export { initializeSocket };
