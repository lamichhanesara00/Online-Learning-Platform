import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" }, // ✅ Set default role as "admin"
    isVerified: { type: Boolean, default: false }, // Admin must be verified manually
}, { timestamps: true });

// ✅ Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const Admin = mongoose.model("Admin", adminSchema);
