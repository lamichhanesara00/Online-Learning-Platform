// routes/admin.js
import express from "express";
import { isAuth /*, isAdmin*/ } from "../middlewares/isAuth.js";
import { createCourse, addLectures } from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

/**
 * POST /api/admin/course/new
 * Creates a new course
 * - If you want admin-only, uncomment isAdmin
 */
router.post(
  "/course/new",
  isAuth,
  // isAdmin,
  uploadFiles.single("cover"),
  createCourse
);

/**
 * POST /api/admin/course/:id/lectures
 * Adds lectures to an existing course
 */
router.post(
  "/course/:id/lectures",
  isAuth,
  // isAdmin,
  addLectures
);

export default router;
