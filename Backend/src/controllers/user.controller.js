import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Notification } from "../models/notification.model.js";



const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details form frontend
  // validation - not empty
  // check if user already exists: username , email
  // crate user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res


  const { fullName, email, username, password, phoneNo } = req.body
  console.log("Received body:", req.body);
  console.log("email : ", email);
  console.log("fullName : ", fullName);

  if (
    [fullName, email, username, password, phoneNo].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fiels are required")
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists")
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username,
    phoneNo
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const { username, email, password } = req.body
  console.log("Request Body:", req.body.username);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User credentials")
  }

  // we can update the exiting user object if database access seems expensive
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true, // only accessible by server
    secure: true
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken,
          refreshToken
        },
        "User logged In Successfully"
      )
    )


})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true // this results in returning updated value without the refresh token
    }
  )

  const options = {
    httpOnly: true, // only accessible by server
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        "User logged out"
      )
    )

})

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const notifications = await Notification.find({ receiver: userId, read: false }).sort({ createdAt: -1 });

  res.status(200)
    .json(new ApiResponse(200, { user, notifications }, "user fetched successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body



  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const updateUserDetails = asyncHandler(async (req, res) => {
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
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.user._id }
    });
    if (existingUser) {
      throw new ApiError(409, "Username already taken");
    }
  }

  // Check for phone number uniqueness if phoneNo is being updated
  if (phoneNo) {
    const existingPhone = await User.findOne({
      phoneNo,
      _id: { $ne: req.user._id }
    });
    if (existingPhone) {
      throw new ApiError(409, "Phone number already in use");
    }
  }

  // Perform the update
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  changeCurrentPassword,
  updateUserDetails
}