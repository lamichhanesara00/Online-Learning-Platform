import express from "express";
import { getAdminProfile } from "../controllers/adminprofile.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/** ✅ Route: Fetch Admin Profile */
router.get("/profile", verifyAdmin, getAdminProfile);

export default router;
