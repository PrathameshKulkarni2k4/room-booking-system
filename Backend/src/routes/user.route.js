import { Router } from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserDetails, changeCurrentPassword } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { clearAllNotifications, deleteNotification, getNotification, markRead } from "../controllers/notification.controller.js";

const router = Router()

router.route("/register").post(upload.none(),registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/profile").get(verifyJWT, getUserProfile)
router.route("/profile").patch(upload.none(), verifyJWT, updateUserDetails)
router.route("/profile/password").patch(upload.none(), verifyJWT, changeCurrentPassword)

router.route("/notifications/clear").delete(verifyJWT, clearAllNotifications) // clear all notification
router.route("/notifications/:notificationId").get(verifyJWT, getNotification) // get notification of owner
router.route("/notifications/:notificationId").patch(verifyJWT, markRead) // mark notification read
router.route("/notifications/:notificationId").delete(verifyJWT, deleteNotification) // delete (clear) a notification of owner

export default router