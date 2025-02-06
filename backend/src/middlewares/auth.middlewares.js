import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchndler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asynchandler(async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
})


const verifyAdmin = asynchandler(async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        if (!user.isadmin) {
            throw new ApiError(403, "Access denied, not an admin")
        }
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
})

export { verifyJWT, verifyAdmin };