import express from "express";
import { getStudentProgress, updateStudentProgress } from "../controllers/progress.js";
import { verifyUser } from "../middlewares/authMiddleware.js";  // Import auth middleware
import { verifyProgress } from "../middlewares/progressMiddleware.js";  // Import progress middleware

const router = express.Router();

// ✅ Get Student Progress (uses the verifyProgress middleware)
router.get("/track/:studentId/:courseId", verifyUser, verifyProgress, getStudentProgress);

// ✅ Update Student Progress
router.post("/update", verifyUser, updateStudentProgress);

export default router;
