import express from "express";
const router = express.Router();
// Middlewares
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  registerRoom,
  getNearbyAvailableRooms,
  getRoomProfile,
  addRoomFeedback,
  deleteRoom,
  getAvailableRooms,
  updateRoom,
  updateRoomDetails
} from "../controllers/room.controller.js";


// (owner only)
router.route("/register").post(verifyJWT, upload.array("images", 5), registerRoom); // register room
router.route("/:roomId").patch(verifyJWT, updateRoomDetails) // update status, price and facilities
router.route("/:roomId").delete(verifyJWT, deleteRoom) // delete room

// (user only)
router.route("/:roomId/feedback").post(verifyJWT, addRoomFeedback); // adding room feedback

// (public)
router.route("/nearby").get(getNearbyAvailableRooms); // find nearby rooms
router.route("/available").get(getAvailableRooms) // get all available rooms
router.route("/:roomId").get(getRoomProfile); // get a room profile info

export default router;
