// controllers/user.js
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";
import bcrypt from "bcrypt";
import sendMail from "../middlewares/sendMail.js";
import jwt from "jsonwebtoken";

// ✅ Register User
const register = async (req, res) => {
  try {
    let { email, name, password, role } = req.body;

    // 1) Normalize email to avoid case issues
    email = email.toLowerCase().trim();

    // 2) Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3) Ensure password is provided
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // 4) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5) Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 6) Create new user document
    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      role,
      otpCreatedAt: new Date(),
      isVerified: false,
    });

    await user.save();

    // 7) Generate JWT Activation Token (1 hour)
    const activationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 8) Send OTP via email
    await sendMail(user.email, "Your OTP Code", { name: user.name, otp });

    // 9) Return success response
    return res.status(201).json({
      message: "User registered successfully! Check your email for OTP.",
      email: user.email,
      activationToken,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Verify User (OTP)
const verifyUser = async (req, res) => {
  try {
    let { email, otp, activationToken } = req.body;
    // 1) Normalize email
    email = email.toLowerCase().trim();

    // 2) Ensure all fields are present
    if (!email || !otp || !activationToken) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 3) Fetch user from DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4) Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // 5) Verify activation token
    let decodedToken;
    try {
      decodedToken = jwt.verify(activationToken, process.env.JWT_SECRET);
      if (decodedToken.email !== user.email) {
        return res
          .status(400)
          .json({ message: "Invalid activation token for this user." });
      }
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired activation token." });
    }

    // 6) Ensure OTP fields exist
    if (!user.otp || !user.otpCreatedAt) {
      return res
        .status(400)
        .json({ message: "OTP expired or not found. Request a new one." });
    }

    // 7) Check OTP expiration (valid for 10 minutes)
    const otpCreationTime = new Date(user.otpCreatedAt).getTime();
    const now = Date.now();
    const expirationTime = 10 * 60 * 1000; // 10 minutes

    if (now - otpCreationTime > expirationTime) {
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new one." });
    }

    // 8) Compare OTP (string comparison)
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Try again." });
    }

    // 9) Mark user as verified & clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpCreatedAt = null;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "User verified successfully!" });
  } catch (error) {
    console.error("Verification Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    // 1) Normalize email
    email = email.toLowerCase().trim();

    // 2) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "No user found with this email." });
    }

    // 3) Check if user is verified before allowing login
    if (!user.isVerified) {
      return res.status(400).json({
        message: "User is not verified. Please verify your account first.",
      });
    }

    // 4) Compare password with stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Wrong password." });
    }

    // 5) Create JWT token with the user's ID
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 6) Return token to client
    return res.status(200).json({
      message: "User logged in successfully!",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ✅ Get User Profile (Protected Route)
const myProfile = async (req, res) => {
  try {
    // Assume req.user is set by an auth middleware (e.g., via JWT verification)
    let user;
    if (req.user.role === "admin") {
      user = await Admin.findById(req.user._id).select("-password"); // Exclude password
    } else {
      user = await User.findById(req.user._id).select("-password"); // Exclude password
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile fetched successfully!",
      user,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export { register, verifyUser, loginUser, myProfile };
