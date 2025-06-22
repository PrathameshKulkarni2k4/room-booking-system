import { Router } from "express";
import { registerOwner, loginOwner, logoutOwner, getOwnerProfile, updateOwnerDetails } from "../controllers/owner.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { clearAllNotifications, deleteNotification, getNotification, markRead } from "../controllers/notification.controller.js";

const router = Router()

router.route("/register").post(upload.none(),registerOwner)
router.route("/login").post(loginOwner)
router.route("/logout").post(verifyJWT, logoutOwner)

router.route("/profile").get(verifyJWT, getOwnerProfile)
router.route("/profile").patch(upload.none(), verifyJWT, updateOwnerDetails)

router.route("/notifications/clear").delete(verifyJWT, clearAllNotifications) // clear all notification
router.route("/notifications/:notificationId").get(verifyJWT, getNotification) // get notification of owner
router.route("/notifications/:notificationId").patch(verifyJWT, markRead) // mark notification read
router.route("/notifications/:notificationId").delete(verifyJWT, deleteNotification) // delete (clear) a notification of owner

export default router