import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/register.js"; // ✅ Import from register.js model

/**
 * ✅ ADMIN REGISTRATION FUNCTION
 */
export const registerAdmin = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    email = email.toLowerCase().trim();

    // ✅ Check if the admin email is already in use
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists." });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create a new admin user
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    await newAdmin.save();

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: newAdmin._id, role: newAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Admin registered successfully!",
      token,
      admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email },
    });
  } catch (error) {
    console.error("Admin Registration Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
