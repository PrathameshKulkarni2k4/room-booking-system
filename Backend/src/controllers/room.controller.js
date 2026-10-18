import { Room } from "../models/room.model.js";
import { Owner } from "../models/owner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geocoder } from "../utils/geocoder.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const ALLOWED_FACILITIES = [
  "Wi-Fi",
  "Hot Water",
  "Kitchen",
  "Parking",
  "Attach Bathroom",
  "Balcony",
  "Bed",
  "Chair",
  "Desk",
  "Wardrobe",
];

const parseFacilities = (raw) => {
  if (raw === undefined || raw === null) return undefined;
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      value = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(value)) {
    throw new ApiError(400, "Facilities should be an array");
  }
  const invalid = value.find((f) => !ALLOWED_FACILITIES.includes(f));
  if (invalid) {
    throw new ApiError(400, `${invalid} is not a valid facility`);
  }
  return value;
};

const registerRoom = asyncHandler(async (req, res) => {
  const { name, address, price } = req.body;

  if (!name || !address || price === undefined || price === "") {
    throw new ApiError(400, "Name, address and price are required");
  }

  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    throw new ApiError(400, "Price must be a non-negative number");
  }

  const facilities = parseFacilities(req.body.facilities) ?? [];

  let coordinates = req.body.coordinates;
  if (!coordinates || !coordinates.length) {
    const geoData = await geocoder.geocode(address);
    if (!geoData.length) {
      throw new ApiError(400, "Invalid address. Unable to geocode.");
    }
    coordinates = [geoData[0].longitude, geoData[0].latitude];
  } else if (typeof coordinates === "string") {
    coordinates = JSON.parse(coordinates);
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  const imageUrls = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadOnCloudinary(file.path);
      if (!result?.url) {
        throw new ApiError(500, "Failed to upload images");
      }
      return result.url;
    })
  );

  const newRoom = await Room.create({
    name,
    address,
    location: { type: "Point", coordinates },
    price: numericPrice,
    facilities,
    images: imageUrls,
    owner: req.user._id,
  });

  await Owner.findByIdAndUpdate(
    req.user._id,
    { $push: { rooms: newRoom._id } },
    { new: true }
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newRoom, "Room registered successfully"));
});

const getNearbyAvailableRooms = asyncHandler(async (req, res) => {
  const {
    longitude,
    latitude,
    radius = 5000,
    minPrice,
    maxPrice,
    facilities,
  } = req.query;

  if (!longitude || !latitude) {
    throw new ApiError(400, "Longitude and latitude are required");
  }

  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(radius),
      },
    },
    status: "Available",
  };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (facilities) {
    const facilitiesArray = Array.isArray(facilities)
      ? facilities
      : facilities.split(",");
    query.facilities = { $all: facilitiesArray };
  }

  const rooms = await Room.find(query)
    .populate("owner", "username fullName email phoneNo")
    .select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, rooms, "Nearby rooms fetched successfully"));
});

const getAvailableRooms = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice, facilities } = req.query;

  const filter = { status: "Available" };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (facilities) {
    const facilitiesArray = Array.isArray(facilities)
      ? facilities
      : facilities.split(",");
    filter.facilities = { $all: facilitiesArray };
  }

  const rooms = await Room.find(filter)
    .populate("owner", "username fullName email phoneNo")
    .select("-__v");

  // An empty result is valid, not an error.
  return res
    .status(200)
    .json(new ApiResponse(200, rooms, "Available rooms fetched successfully"));
});

const getRoomProfile = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findById(roomId)
    .populate("owner", "username fullName email phoneNo")
    .populate("feedback.user", "username");

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, room, "Room details fetched"));
});

const updateRoomDetails = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { price, status, facilities } = req.body;
  const files = req.files;

  const room = await Room.findOne({ _id: roomId, owner: req.user._id });
  if (!room) {
    throw new ApiError(404, "Room not found or unauthorized");
  }

  const updateFields = {};

  if (price !== undefined && price !== "") {
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      throw new ApiError(400, "Price must be a non-negative number");
    }
    updateFields.price = numericPrice;
  }

  if (status) {
    if (!["Available", "Reserved", "Booked"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    updateFields.status = status;
  }

  const parsedFacilities = parseFacilities(facilities);
  if (parsedFacilities !== undefined) {
    updateFields.facilities = parsedFacilities;
  }

  // Images: only touch the existing set when NEW images are supplied.
  // Upload the new ones first; only if they succeed, delete the old ones.
  if (files && files.length > 0) {
    const uploadedImages = [];
    for (const file of files) {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (uploadResult?.secure_url) {
        uploadedImages.push(uploadResult.secure_url);
      }
    }
    if (uploadedImages.length === 0) {
      throw new ApiError(500, "Failed to upload the new images");
    }
    // New images are safely stored — now remove the previous ones.
    for (const imageUrl of room.images) {
      await deleteFromCloudinary(imageUrl).catch(() => {});
    }
    updateFields.images = uploadedImages;
  }

  const updatedRoom = await Room.findOneAndUpdate(
    { _id: roomId, owner: req.user._id },
    { $set: updateFields },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedRoom, "Room updated successfully"));
});

const deleteRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const room = await Room.findOneAndDelete({
    _id: roomId,
    owner: req.user._id,
  });

  if (!room) {
    throw new ApiError(404, "Room not found or unauthorized");
  }

  await Owner.findByIdAndUpdate(req.user._id, { $pull: { rooms: roomId } });

  await Promise.all(
    room.images.map((imageUrl) =>
      deleteFromCloudinary(imageUrl).catch(() => {})
    )
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Room deleted successfully"));
});

const addRoomFeedback = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { comment, rating } = req.body;

  if (!comment || !comment.trim()) {
    throw new ApiError(400, "Comment is required");
  }

  let numericRating;
  if (rating !== undefined && rating !== null && rating !== "") {
    numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  room.feedback.push({
    user: req.user._id,
    comment: comment.trim(),
    ...(numericRating !== undefined && { rating: numericRating }),
  });

  // Average only over feedback that actually carries a rating, so an
  // unrated comment can never produce NaN.
  const rated = room.feedback.filter((f) => typeof f.rating === "number");
  room.rating = rated.length
    ? rated.reduce((acc, curr) => acc + curr.rating, 0) / rated.length
    : 0;

  await room.save();

  return res
    .status(201)
    .json(new ApiResponse(201, room, "Feedback added successfully"));
});

export {
  registerRoom,
  getNearbyAvailableRooms,
  getAvailableRooms,
  getRoomProfile,
  updateRoomDetails,
  deleteRoom,
  addRoomFeedback,
};
