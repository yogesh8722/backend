import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import UploadOnCloudinary from "../utils/cloudinary.js";
import Jwt from "jsonwebtoken";

// acees token or refresh token genrate krne ke liye code start
const generateAccessAndRefreshToken = async (userId) => {
   try {
      const user = await User.findById(userId)
      const accessToken = await user.generateAccessToken()
      const refreshToken = await user.generateRefreshToken()

      // console.log("accessToken",accessToken);
      // console.log("refreshToken",refreshToken);


      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return { accessToken, refreshToken }
   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating access and refresh token")
   }
}

// register user
const registerUser = asyncHandler(async (req, res) => {

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
   const { username, email, password, fullname } = req.body
   // console.log("username:",username,"email:",email,"password:",password,"fullname:",fullname);


   // validation - not empty
   if (
      [username, email, password, fullname].some((filed) => filed?.trim() === "")
   ) {
      throw new ApiError(400, "All Filed Are Required")
   }

   // check is email already exits
   const existedEmail = await User.findOne({ email })
   if (existedEmail) {
      throw new ApiError(409, "Email is already axist");
   }

   // check is username already exits
   const existedUser = await User.findOne({ username })
   if (existedUser) {
      throw new ApiError(409, "Username is already axist");
   }

   // check for images,upload multer ,check for avatar

   // routes ke andr ek middleware add kr diya h to req.body ki jagah aapko req.files ka access mil jata h
   const avatarLocalFilePath = req.files?.avatar[0]?.path;
   // console.log("avatarLocal:",avatarLocalFilePath);

   // ise work nhi hoga error aaygi
   // const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

   // correct way
   let coverImageLocalFilePath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalFilePath = req.files.coverImage[0].path
   }




   if (!avatarLocalFilePath) {
      throw new ApiError(400, "avatar file is required");
   }


   //  check for cloudinary ,avatar

   const avatar = await UploadOnCloudinary(avatarLocalFilePath);
   const coverImage = await UploadOnCloudinary(coverImageLocalFilePath)
   // console.log("avatar:",avatar);

   if (!avatar) {
      throw new ApiError(400, "avatar file is required to");
   }

   // create user object,create entry for db
   const user = await User.create({
      username: username.toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      fullname,
      email,
      password
   })


   // remove password and refreshtoken filed from response
   const createUser = await User.findById(user._id).select("-password -refreshToken")

   // check for user creation 
   if (!createUser) {
      throw new ApiError(500, "Something went wrong while registring the user")
   }

   // res
   return res.status(201).json(
      new ApiResponse(200, createUser, "User Register Successfully")
   )

})

// login user
const loginUser = asyncHandler(async (req, res) => {
   // req data 
   // username or email check
   //  database me store h ki nhi check
   // password check
   // acees token or refresh token genrate
   // send cookie
   // res

   // req data 
   const { username, email, password } = req.body
   // console.log("req.body",req.body);

   // console.log(username,email,password)

   // username or email check
   if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
   }

   //  database me store h ki nhi check
   const user = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (!user) {
      throw new ApiError(404, "username or email not axist")
   }

   // password check
   const passwordCorrect = await user.isPasswordCorrect(password)
   if (!passwordCorrect) {
      throw new ApiError(401, "invalid user credential")
   }

   // acees token or refresh token genrate
   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


   // send cookie

   // frontend se cookie modify change nhi kr skte h 
   const options = {
      httpOnly: true,
      secure: true
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            { user: loggedInUser, accessToken, refreshToken },
            "User LoggedIn Successfully"
         )
      )
})

// logout user
const logoutUser = asyncHandler(async (req, res) => {

   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   const options = {
      httpOnly: true,
      secure: true
   }

   return res.status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logout Successfully"))
})

// login access token expire to refresh token se login krke fir se genrate access and refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {

   // refresh token access krne ke liye
   // cookies se access token lena
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   console.log("incomingRefreshToken", incomingRefreshToken);

   if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request")
   }

   console.log("process.env.REFRESH_TOKEN_SECRET", process.env.REFRESH_TOKEN_SECRET);


   const decordedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
   )
   console.log("decordedToken", decordedToken);

   const user = await User.findById(decordedToken?._id)
   console.log("user", user)
   if (!user) {
      throw new ApiError(401, "Invalid refreshToken")
   }

   if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Expired or Used")
   }

   const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)
   console.log("accessToken", accessToken);
   console.log("refreshToken", newRefreshToken);


   // frontend se cookie modify change nhi kr skte h 
   const options = {
      httpOnly: true,
      secure: true
   }

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
         new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken },
            "Access Token Refreshed Successfully"
         )
      )
})

const updatePassword = asyncHandler(async (req, res) => {
   // oldpassword and newpassword
   // check old password correct
   // newpassword save database

   // oldpassword and newpassword
   const { oldPassword, newPassword } = req.body
   console.log("oldPassword", oldPassword);

   if (!oldPassword) {
      throw new ApiError(400, "old password filed is required")
   }

   // check old password correct
   const user = await User.findById(req.user?._id)
   console.log("user", user);
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
      throw new ApiError(400, "user password is incorrected")
   }

   // newpassword save database
   user.password = newPassword
   await user.save({ validateBeforeSave: false })

   return res
      .status(200)
      .json(new ApiResponse(200, {}, "User Password is Updated"))

})

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(200, req.user, "current user fetch Successfully")
})

const currentAccountUpdate = asyncHandler(async (req, res) => {
   // from data
   // check filed is required
   // data save database

   // from data
   const { email, fullname } = req.body

   // check filed is required
   if (!email || !fullname) {
      throw new ApiError(400, "email or fullname filed are required");
   }

   // data save database
   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname,
            email
         }
      },
      { new: true } //update hone ke baad ki information return hoti h
         .select("-password")
   )

   return res
      .status(200)
      .json(new ApiResponse(200, user, "User Detail Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar Image Local File Path is Missing")
   }

   // path to cloudinary
   const avatar = await UploadOnCloudinary(avatarLocalPath)

   if (!avatar.url) {
      throw new ApiError(400, "Cloudinary Avatar File Path is Missing")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            avatar: avatar.url
         }
      },
      { new: true }
   ).select("-password")

   return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar Image Updated Successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path

   if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image Local File Path is Missing")
   }

   // path to cloudinary
   const coverImage = await UploadOnCloudinary(coverImageLocalPath)

   if (!coverImage.url) {
      throw new ApiError(400, "Cloudinary coverImage File Path is Missing")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            coverImage: coverImage.url
         }
      },
      { new: true }
   ).select("-password")

   return res
      .status(200)
      .json(new ApiResponse(200, user, "coverImage Updated Successfully"))

})

export {
   loginUser,
   logoutUser,
   refreshAccessToken,
   updatePassword,
   getCurrentUser,
   currentAccountUpdate,
   updateUserAvatar,
   updateUserCoverImage
}
export default registerUser