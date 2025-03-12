import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Load environment variables at the TOP
dotenv.config();

console.log("🔍 Debug: DB =", process.env.DB || "NOT LOADED");

const connectDB = async () => {
  try {
    if (!process.env.DB) {
      throw new Error("❌ MongoDB URI is undefined! Check your .env file.");
    }

    await mongoose.connect(process.env.DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
