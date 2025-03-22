import express from "express";
import {
  createEnrollment,
  getUserEnrollments,
  getEnrollmentById,
  checkEnrollment,
  getUserCoursesWithProgress,
} from "../controllers/enrollment.js";

const router = express.Router();

// Create a new enrollment
router.post("/", createEnrollment);

// Get all enrollments for a user
router.get("/user/:userId", getUserEnrollments);

// Get all courses with progress for a user
router.get("/user/:userId/progress", getUserCoursesWithProgress);

// Get enrollment details by ID
router.get("/:id", getEnrollmentById);

// Check if a user is enrolled in a specific course
router.get("/check/:userId/:courseId", checkEnrollment);

export default router;
