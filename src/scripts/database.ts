import mongoose from "mongoose";
import { MONGO_URI } from "../utils/config";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
