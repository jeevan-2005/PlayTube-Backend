import ApiError from "../utils/ApiError.js";
import asyncHanlder from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // when we save the User Db will validate evrything like email, username required etc but to avoid those becz already present we use .save({validateBeforeSave: false})
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};



const registerUser = asyncHanlder(async (req, res) => {
  // get user details fron frontend
  // validation
  // check if user already exists: using username or email
  // check for images , check for avator if available upload to cloudinary
  // create user in db
  // remove password and refreshToken from response
  // check for user creation
  // return response

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
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
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHanlder(async (req, res) => {
  // data from req.body
  // check username or email and password
  // check if user exists
  // check password
  // generate token
  // send cookies
  // return response

  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // we have method to check password this should applied on user (instance of User Model) not User(model)
  const isPasswordValid = await user.isPasswordMatched(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findOne({ _id: user._id }).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHanlder(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true, // gives me the updated user
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };