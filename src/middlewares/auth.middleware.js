import Jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// check user h ya nhi h
export const VerifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        // console.log("cookies",req.cookies?.accessToken);
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

        // Check if token is valid
if (!token || typeof token !== "string") {
    console.error("Invalid Token:", token);
    throw new ApiError(404, "Unauthorized request: Token is missing or invalid");
}

        // console.log("token",token);
        
    
        if(!token){
            throw new ApiError(404,"Unauthorized request")
        }
    // console.log("secret access",process.env.ACCESS_TOKEN_SECRET);
    
        const decordedToken = Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    // console.log("decordedToken",decordedToken);
    
        const user = await User.findById(decordedToken?._id).select("-refreshToken -password")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user=user

        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }

})