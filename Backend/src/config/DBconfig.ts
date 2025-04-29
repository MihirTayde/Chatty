import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_CONNECTION_STRING;

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable not defined");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connection established successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}
export default connectDB;


