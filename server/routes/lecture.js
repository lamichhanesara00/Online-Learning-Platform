import express from "express";
import {
  getLectureById,
  getLectures,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * ✅ Route: Get all lectures
 * @method GET /api/lectures
 */
router.get("/", getLectures);

/**
 * ✅ Route: Get one lecture
 * @method GET /api/lectures/:id
 */
router.get("/:id", getLectureById);

/**
 * ✅ Route: Update a lecture (Admin Only)
 * @method PATCH /api/lectures/:id
 */
router.put("/:id", verifyAdmin, updateLecture);

/**
 * ✅ Route: Delete a lecture (Admin Only)
 * @method Delete /api/lectures/:id
 */
router.delete("/:id", deleteLecture);

export default router;
