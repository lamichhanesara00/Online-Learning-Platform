// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },

  // Fields for OTP verification flow:
  otp: { type: String }, // The OTP code itself
  otpCreatedAt: { type: Date }, // When the OTP was generated

  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);
