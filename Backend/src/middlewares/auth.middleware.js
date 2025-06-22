import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { Owner } from "../models/owner.model.js";


// next is used in middleware
export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        let account = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
        if (!account) {
          account = await Owner.findById(decodedToken?._id).select("-password -refreshToken");
        }
    
        if (!account) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = account;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})



