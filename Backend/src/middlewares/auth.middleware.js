import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Owner } from "../models/owner.model.js";

// Authentication: verify the access token and resolve the account.
// Sets req.user (the account document), req.accountType ("User" | "Owner") and req.role.
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  let account = await User.findById(decodedToken?._id).select(
    "-password -refreshToken"
  );
  let accountType = "User";

  if (!account) {
    account = await Owner.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    accountType = "Owner";
  }

  if (!account) {
    throw new ApiError(401, "Invalid access token");
  }

  req.user = account;
  req.accountType = accountType; // "User" | "Owner"
  req.role = accountType === "Owner" ? "owner" : "user";
  next();
});

// Authorisation: only owners may proceed.
export const requireOwner = asyncHandler(async (req, res, next) => {
  if (req.accountType !== "Owner") {
    throw new ApiError(403, "Owner access required");
  }
  next();
});

// Authorisation: only seekers (users) may proceed.
export const requireUser = asyncHandler(async (req, res, next) => {
  if (req.accountType !== "User") {
    throw new ApiError(403, "User access required");
  }
  next();
});
