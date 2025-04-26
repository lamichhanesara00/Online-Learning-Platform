import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js"; // ✅ Import Admin model from register.js

/**
 * ✅ ADMIN LOGIN FUNCTION
 */
export const loginAdmin = async (req, res) => {
  console.log(`Admin Login Request: ${req.body.email}`);
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    // ✅ Find admin user in database
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    if (!admin.isVerified) {
      return res.status(400).json({ message: "Admin is not verified." });
    }

    // ✅ Compare password
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", {password, adminPassword: admin.password, isPasswordMatch});
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Wrong password." });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Admin login successful!",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
