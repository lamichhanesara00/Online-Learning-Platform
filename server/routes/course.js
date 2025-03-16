import express from "express";
import CourseController from "../controllers/course.js"; // ✅ Import course controller
import feedbackRoutes from "./feedback.js"; // ✅ Import feedback routes
import { uploadFiles } from "../middlewares/multer.js"; // ✅ If using file uploads
import { addLectures } from "../controllers/admin.js";

const router = express.Router();

// ✅ Course routes
router.post(
  "/create",
  uploadFiles.single("cover"),
  CourseController.createCourse
);
router.get("/all", CourseController.getAllCourses);
router.post("/:id/lecture", addLectures);

// ✅ Attach feedback routes inside course
router.use("/:courseId/feedback", feedbackRoutes);

export default router;
