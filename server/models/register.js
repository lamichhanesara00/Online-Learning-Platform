import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" }, // ✅ Only "admin"
  isVerified: { type: Boolean, default: true }, // ✅ Admins are verified by default
}, { timestamps: true });

export const Admin = mongoose.model("Admin", adminSchema); // ✅ Named export
