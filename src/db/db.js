import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";
import { json } from "express";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected successfully -- DB host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection failed : ", error);
    process.exit(1);
  }
};

export default connectDB;
