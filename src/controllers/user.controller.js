import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import UploadOnCloudinary from "../utils/cloudinary.js";

const registerUser=asyncHandler(async(req,res)=>{
 
   // get user detail frontend
   // validation - not empty
   // check is username or email already exits
   // check for images,upload multer ,check for avatar
   //  check for cloudinary ,avatar
   // create user object,create entry for db
   // remove password and refreshtoken filed from response
   // check for user creation 
   // res  

   // get user detail frontend
   const {username,email,password,fullname}=req.body
   console.log("username:",username,"email:",email,"password:",password,"fullname:",fullname);
   

   // validation - not empty
   if(
      [username,email,password,fullname].some((filed)=>filed?.trim()==="")
   ){
      throw new ApiError(400,"All Filed Are Required")
   }

   // check is email already exits
   const existedEmail=await User.findOne({email})
   if(existedEmail){
      throw new ApiError(409,"Email is already axist");
   }

   // check is username already exits
   const existedUser=await User.findOne({username})
   if(existedUser){
      throw new ApiError(409,"Username is already axist");
   }


   // check for images,upload multer ,check for avatar

   // routes ke andr ek middleware add kr diya h to req.body ki jagah aapko req.files ka access mil jata h
   const avatarLocalFilePath = req.files?.avatar[0]?.path;
   console.log("avatarLocal:",avatarLocalFilePath);

// ise work nhi hoga error aaygi
   // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

   // correct way
   let coverImageLocalFilePath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalFilePath=req.files.coverImage[0].path
   }




   if(!avatarLocalFilePath){
      throw new ApiError(400,"avatar file is required");
   }


   //  check for cloudinary ,avatar

   const avatar=await UploadOnCloudinary(avatarLocalFilePath);
   const coverImage=await UploadOnCloudinary(coverImageLocalFilePath)
console.log("avatar:",avatar);

   if(!avatar){
      throw new ApiError(400,"avatar file is required to");
   }

   // create user object,create entry for db
   const user=await User.create({
      username:username.toLowerCase(),
      avatar:avatar.url,
      coverImage:coverImage?.url || "",
      fullname,
      email,
      password
   })


   // remove password and refreshtoken filed from response
   const createUser=await User.findById(user._id).select("-password -refreshToken")

   // check for user creation 
   if(!createUser){
      throw new ApiError(500,"Something went wrong while registring the user")
   }

   // res
   return res.status(201).json(
      new ApiResponse(200,createUser,"User Register Successfully")
   )

})

export default registerUser