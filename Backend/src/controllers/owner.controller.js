import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Owner } from "../models/owner.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

const generateAccessAndRefreshTokens = async (ownerId) => {
  try {
    const owner = await Owner.findById(ownerId);
    const accessToken = owner.generateAccessToken();
    const refreshToken = owner.generateRefreshToken();

    owner.refreshToken = refreshToken;
    await owner.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerOwner = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, phoneNo } = req.body;

  console.log(req.body);


  if (
    [fullName, email, username, password, phoneNo].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedOwner = await Owner.findOne({
    $or: [{ username }, { email }]
  });

  if (existedOwner) {
    throw new ApiError(409, "Owner with email or username already exists");
  }

  const owner = await Owner.create({
    fullName,
    email,
    password,
    username,
    phoneNo
  });

  const createdOwner = await Owner.findById(owner._id).select(
    "-password -refreshToken"
  );

  if (!createdOwner) {
    throw new ApiError(500, "Something went wrong while registering an owner");
  }

  return res.status(201).json(
    new ApiResponse(200, createdOwner, "Owner registered successfully")
  );
});

const loginOwner = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const owner = await Owner.findOne({
    $or: [{ username }, { email }]
  });

  if (!owner) {
    throw new ApiError(404, "Owner does not exist");
  }

  const isPasswordValid = await owner.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(owner._id);

  const loggedInOwner = await Owner.findById(owner._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInOwner,
        accessToken,
        refreshToken
      }, "Owner logged in successfully")
    );
});

const logoutOwner = asyncHandler(async (req, res) => {
  await Owner.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Owner logged out"));
});

const getOwnerProfile = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const owner = await Owner.findById(ownerId).select("-password -refreshToken").populate("rooms");

  if (!owner) {
    throw new ApiError(404, "Owner not found")
  }

  const notifications = await Notification.find({ receiver: ownerId, read: false }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { owner, notifications }, "owner fetched successfully")
  )
});

const updateOwnerDetails = asyncHandler(async (req, res) => {
  const { username, fullName, phoneNo } = req.body;

  // Check if at least one field is provided
  if (!username && !fullName && !phoneNo) {
    throw new ApiError(400, "At least one field (username, fullName, or phoneNo) must be provided");
  }

  // Initialize update object
  const updateData = {};

  // Validate and add username to update if provided
  if (username) {
    if (username.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters long");
    }
    updateData.username = username.toLowerCase();
  }

  // Validate and add fullName to update if provided
  if (fullName) {
    if (fullName.trim().length < 2) {
      throw new ApiError(400, "Full name must be at least 2 characters long");
    }
    updateData.fullName = fullName.trim();
  }

  // Validate and add phoneNo to update if provided
  if (phoneNo) {
    if (!/^\d{10,15}$/.test(phoneNo)) {
      throw new ApiError(400, "Phone number must be 10-15 digits");
    }
    updateData.phoneNo = phoneNo;
  }

  // Check for username uniqueness if username is being updated
  if (username) {
    const existingOwner = await Owner.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.user._id }
    });
    if (existingOwner) {
      throw new ApiError(409, "Username already taken");
    }
  }

  // Check for phone number uniqueness if phoneNo is being updated
  if (phoneNo) {
    const existingPhone = await Owner.findOne({
      phoneNo,
      _id: { $ne: req.user._id }
    });
    if (existingPhone) {
      throw new ApiError(409, "Phone number already in use");
    }
  }

  // Perform the update
  const updatedOwner = await Owner.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-password -refreshToken");

  if (!updatedOwner) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedOwner, "User details updated successfully"));
});

export {
  registerOwner,
  loginOwner,
  logoutOwner,
  getOwnerProfile,
  updateOwnerDetails
};
