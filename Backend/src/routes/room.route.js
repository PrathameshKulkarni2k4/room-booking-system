import express from "express";
const router = express.Router();
// Middlewares
import {
  verifyJWT,
  requireOwner,
  requireUser,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  registerRoom,
  getNearbyAvailableRooms,
  getRoomProfile,
  addRoomFeedback,
  deleteRoom,
  getAvailableRooms,
  updateRoomDetails,
} from "../controllers/room.controller.js";

// (owner only)
router
  .route("/register")
  .post(verifyJWT, requireOwner, upload.array("images", 5), registerRoom); // register room
router
  .route("/:roomId")
  .patch(verifyJWT, requireOwner, upload.array("images", 5), updateRoomDetails); // update status, price, facilities, images
router.route("/:roomId").delete(verifyJWT, requireOwner, deleteRoom); // delete room

// (user only)
router.route("/:roomId/feedback").post(verifyJWT, requireUser, addRoomFeedback); // adding room feedback

// (public)
router.route("/nearby").get(getNearbyAvailableRooms); // find nearby rooms
router.route("/available").get(getAvailableRooms); // get all available rooms
router.route("/:roomId").get(getRoomProfile); // get a room profile info

export default router;
