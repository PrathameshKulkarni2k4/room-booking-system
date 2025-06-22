import { Router } from "express";
import { sendVerificationCode, verifyCode } from "../controllers/verification.controller.js";

const router = Router()

router.route("/send-code").post(sendVerificationCode)
router.route("/verify-code").post(verifyCode)

export default router