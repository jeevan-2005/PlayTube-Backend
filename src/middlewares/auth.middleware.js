import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

// we can see that in below code res is not used since we are not sending any response so we can just replace"" res by _ ""

export const isAuth = asyncHandler(async (req, _ , next) => {
  try {
    // in web we have access to cookies but for mobiles app we get from headers
    const accessToken =
      req.cookies?.accessToken || req.header("Authorization").split(" ")[1];

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }
});
