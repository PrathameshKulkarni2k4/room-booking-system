import { Room } from "../models/room.model.js";
import { Owner } from "../models/owner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { geocoder } from "../utils/geocoder.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { Booking } from "../models/booking.model.js";

const registerRoom = asyncHandler(async (req, res) => {
    const {
        name,
        address,
        price,
    } = req.body;

    const facilities = JSON.parse(req.body.facilities);

    if (!name || !address || !price) {
        throw new ApiError(400, "Name, address and price are required");
    }

    let coordinates = req.body.coordinates;
    if (!coordinates || !coordinates.length) {
        const geoData = await geocoder.geocode(address);
        if (!geoData.length) {
            throw new ApiError(400, "Invalid address. Unable to geocode.");
        }
        coordinates = [geoData[0].longitude, geoData[0].latitude];
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
        location: {
            type: "Point",
            coordinates
        },
        price,
        facilities: facilities || [],
        images: imageUrls,
        owner: req.user._id
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
    const { longitude, latitude, radius = 5000, minPrice, maxPrice, facilities } = req.query;

    if (!longitude || !latitude) {
        throw new ApiError(400, "Longitude and latitude are required");
    }

    const query = {
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                },
                $maxDistance: parseFloat(radius)
            }
        },
        status: "Available"
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
        .populate('owner', 'username email phoneNo')
        .select('-__v');

    return res
        .status(200)
        .json(new ApiResponse(200, rooms, "Nearby rooms fetched successfully"));
});


const getAvailableRooms = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, facilities } = req.query;

    const filter = {
        status: "Available"
    };

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
        .populate("owner", "username email phoneNo")
        .select("-__v");

    if (!rooms) {
        throw new ApiError(404,"no available rooms")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, rooms, "Available rooms fetched successfully"));
});

const getRoomProfile = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?._id; // Assumes JWT auth middleware sets req.user

    const room = await Room.findById(roomId)
        .populate('owner', 'username email phoneNo')
        .populate('feedback.user', 'username');

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    let alreadyBookedByUser = false;
    let bookingId = null;

    if (userId) {
        const existingBooking = await Booking.findOne({
            room: roomId,
            user: userId,
            status: 'approved',
        });

        if (existingBooking) {
            alreadyBookedByUser = true;
            bookingId = existingBooking._id;
        }
    }

    const responsePayload = {
        ...room.toObject(),
        alreadyBookedByUser,
        bookingId,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, responsePayload, "Room details fetched"));
});


const updateRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { price, status, facilities } = req.body;

    // Check if price is provided and valid
    if (price !== undefined && (isNaN(price) || price <= 0)) {
        throw new ApiError(400, "Valid price is required.");
    }

    // Check if status is provided and valid
    if (status && !["Available", "Booked"].includes(status)) {
        throw new ApiError(400, "Invalid status value. It must be 'Available' or 'Booked'.");
    }

    // Check if facilities are provided and valid
    if (facilities) {
        if (!Array.isArray(facilities)) {
            throw new ApiError(400, "Facilities should be an array.");
        }

        const allowedFacilities = [
            "Wi-Fi", "Hot Water", "Kitchen", "Parking", "Attach Bathroom", 
            "Balcony", "Bed", "Chair", "Desk", "Wardrobe"
        ];

        facilities.forEach(facility => {
            if (!allowedFacilities.includes(facility)) {
                throw new ApiError(400, `${facility} is not a valid facility.`);
            }
        });
    }

    // Find the room and update the fields (price, status, and facilities)
    const updatedRoom = await Room.findOneAndUpdate(
        { _id: roomId, owner: req.user._id }, // Ensure room belongs to the owner
        { 
            $set: {
                ...(price !== undefined && { price }),
                ...(status && { status }),
                ...(facilities && { facilities })
            }
        }, // Update the price, status, and/or facilities
        { new: true } // Return the updated room
    );

    if (!updatedRoom) {
        throw new ApiError(404, "Room not found or unauthorized");
    }

    return res.status(200).json({
        success: true,
        message: "Room updated successfully",
        data: updatedRoom,
    });
});

const updateRoomDetails = asyncHandler(async (req, res) => {
    const { roomId } = req.params; // Extract roomId from URL params
    const { price, status, facilities } = req.body; // Get fields from the request body
    const files = req.files; // Assuming images are in the 'files' field
  
    // Find the room and ensure it belongs to the owner
    const room = await Room.findOne({ _id: roomId, owner: req.user._id });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }
  
    // Handle deleting old images from Cloudinary
    for (let imageUrl of room.images) {
      await deleteFromCloudinary(imageUrl); // Delete old image from Cloudinary
    }
  
    // Handle uploading new images to Cloudinary
    const uploadedImages = [];
    if (files && files.length > 0) {
      for (let file of files) {
        const uploadResult = await uploadOnCloudinary(file.path); // Upload file to Cloudinary
        if (uploadResult) {
          uploadedImages.push(uploadResult.secure_url); // Store the secure URL
        }
      }
    }
  
    // Prepare the update object
    const updateFields = {
      ...(price !== undefined && { price }),
      ...(status && { status }),
      ...(facilities && { facilities }),
      ...(uploadedImages.length > 0 && { images: uploadedImages }), // Update images if new images exist
    };
  
    // Update the room with the new fields
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, owner: req.user._id }, // Ensure room belongs to the owner
      { $set: updateFields }, // Use spread operator to only set the fields that are provided
      { new: true } // Return the updated room
    );

    if (status === "Available") {
        console.log("room deleted when status is changes to available ...")
        await Booking.deleteMany({
            room: roomId,
            status: "approved",
        });
    }
  
    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom,
    });
  });

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    console.log("Deleting Room:", roomId, "Owner:", req.user._id);
    const room = await Room.findOneAndDelete({
        _id: roomId,
        owner: req.user._id
    });

    if (!room) {
        throw new ApiError(404, "Room not found or unauthorized");
    }

    await Promise.all(
        room.images.map(imageUrl =>
            deleteFromCloudinary(imageUrl).catch(console.error)
        )
    );

    return res
        .status(204)
        .json(new ApiResponse(204, null, "Room deleted successfully"));
});

const addRoomFeedback = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { comment, rating } = req.body;

    const feedback = {
        user: req.user._id,
        comment,
        rating
    };

    const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        { $push: { feedback } },
        { new: true }
    );

    if (rating) {
        const avgRating = updatedRoom.feedback.reduce(
            (acc, curr) => acc + curr.rating, 0) / updatedRoom.feedback.length;
        await Room.findByIdAndUpdate(roomId, { rating: avgRating });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRoom, "Feedback added successfully"));
});

export {
    registerRoom,
    getNearbyAvailableRooms,
    getAvailableRooms,
    getRoomProfile,
    updateRoom,
    updateRoomDetails,
    deleteRoom,
    addRoomFeedback,
};