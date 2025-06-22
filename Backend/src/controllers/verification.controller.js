import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import nodemailer from "nodemailer";

// Temporary storage (replace with Redis in production)
const verificationCodes = new Map();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log(email);
  
  
  // Validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Generate and store verification code
  const code = generateVerificationCode();
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 15 minutes expiration
    verified: false
  });

  // Prepare email
  const mailOptions = {
    from: `RoomBuddy <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Please use the following code to verify your email address:</p>
        <div style="background: #f4f4f4; padding: 10px; margin: 20px 0; font-size: 24px; font-weight: bold; text-align: center;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  // Send email
  await transporter.sendMail(mailOptions);

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification code sent to your email"));
});

const verifyCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  
  // Basic validation
  if (!email || !code) {
    throw new ApiError(400, "Both email and verification code are required");
  }

  const record = verificationCodes.get(email);
  
  // Check if verification was initiated
  if (!record) {
    throw new ApiError(400, "No verification request found for this email. Please request a new code.");
  }

  // Check if code expired
  if (Date.now() > record.expires) {
    verificationCodes.delete(email);
    throw new ApiError(400, "Verification code has expired. Please request a new one.");
  }

  // Verify code
  if (record.code !== code) {
    throw new ApiError(400, "Incorrect verification code. Please try again.");
  }

  // Mark as verified
  verificationCodes.set(email, { ...record, verified: true });
  
  return res
    .status(200)
    .json(new ApiResponse(200, { email }, "Email verified successfully"));
});

// Add a helper function to check verification status (for use in registerUser)
const isEmailVerified = (email) => {
  const record = verificationCodes.get(email);
  return record?.verified === true;
};

export { 
  sendVerificationCode,
  verifyCode,
  isEmailVerified,
};