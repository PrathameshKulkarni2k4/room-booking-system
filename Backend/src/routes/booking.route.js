import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkUserBookedRoom, createBooking, getUserBookedRooms, unbookRoom, updateBookingStatus } from "../controllers/booking.controller.js";

const router = Router()

router.route("/create-booking/:roomId").post(upload.none(), verifyJWT, createBooking) // create a booking
router.route("/:bookingId").patch( verifyJWT, updateBookingStatus); // update booking status
router.route("/user-rooms").get( verifyJWT, getUserBookedRooms)  // get all the rooms booked by user


router.route("/user-booking/:roomId").get( verifyJWT, checkUserBookedRoom); // check if the room booked by logged user
router.route("/unbook/:roomId").delete( verifyJWT, unbookRoom); // cancle the booking by logged user

export default router
