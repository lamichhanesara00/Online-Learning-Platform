import express from "express";
import {
  getStudentProgress,
  updateStudentProgress,
  getStudentAllProgress,
  trackLectureTime,
} from "../controllers/progress.js";
import { verifyProgress } from "../middlewares/progressMiddleware.js"; // Import progress middleware

const router = express.Router();

router.get("/student/:studentId", getStudentAllProgress);

router.get("/:studentId/:courseId", getStudentProgress);

router.post("/update", updateStudentProgress);

router.post("/track-time", trackLectureTime);

export default router;
