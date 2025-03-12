// routes/user.js
import express from "express";
import { register, verifyUser, loginUser, myProfile } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js"; // if you have an auth middleware

const router = express.Router();

// POST /api/user/register
router.post("/register", register);

// POST /api/user/verify-otp
router.post("/verify-otp", verifyUser);

// POST /api/user/login
router.post("/login", loginUser);

// GET /api/user/profile
router.get("/profile", isAuth, myProfile);

export default router;
