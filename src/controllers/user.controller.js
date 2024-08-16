import ApiError from "../utils/ApiError.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

// get user details fron frontend
// validation
// check if user already exists: using username or email
// check for images , check for avator if available upload to cloudinary
// create user in db
// remove password and refreshToken from response
// check for user creation
// return response

const registerUser = asyncHanlder(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  //multer gives us access to files from body request (req.files)

  //   console.log(req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  
  // since coverImage is not required feild we have to check it in classic way using if else. because if we check using optional chaining we will get undefined.
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // since avatar is required feild we have to check for it
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  // since avatar is required feild we have to check for it
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // user.create({})  ===  new user({}).save() --- we can use any one of them
  const newUser = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: avatar.url, // this is checked twice so url will be definetly there.
    coverImage: coverImage?.url || "", // this is not required feild so might be there or "".
  });

  // we can check weather user is created or not
  const createdUser = await User.findOne({ _id: newUser._id }).select(
    "-password -refreshToken" // to remove password and refreshToken from response
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .send(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
