import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, requireOwner, requireUser } from "../middlewares/auth.middleware.js";
import {
  checkUserBookedRoom,
  createBooking,
  getUserBookedRooms,
  unbookRoom,
  updateBookingStatus,
} from "../controllers/booking.controller.js";

const router = Router();

router
  .route("/create-booking/:roomId")
  .post(upload.none(), verifyJWT, requireUser, createBooking); // create a booking (seeker only)

router.route("/:bookingId").patch(verifyJWT, requireOwner, updateBookingStatus); // owner approves/rejects (ownership checked in controller)

router.route("/user-rooms").get(verifyJWT, requireUser, getUserBookedRooms); // rooms booked by the logged-in user

router.route("/user-booking/:roomId").get(verifyJWT, requireUser, checkUserBookedRoom); // has the logged-in user booked this room

router.route("/unbook/:roomId").delete(verifyJWT, requireUser, unbookRoom); // cancel a booking (seeker only)

export default router;
