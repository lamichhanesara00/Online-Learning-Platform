import express from "express";
import {
  addLecture,
  getLectures,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js";
import { getAdminProfile } from "../controllers/adminprofile.js";
import { getUsers, deleteUser } from "../controllers/admin.js";

const router = express.Router();

router.get("/users", verifyAdmin, getUsers);

router.get("/profile", verifyAdmin, getAdminProfile);

router.delete("/users/:id", deleteUser);

/**
 * ✅ Route: Add a lecture (Admin Only)
 * @method POST /api/admin/add-lecture
 */
router.post("/add-lecture", verifyAdmin, addLecture);

/**
 * ✅ Route: Get all lectures
 * @method GET /api/admin/get-lectures
 */
router.get("/get-lectures", getLectures);

/**
 * ✅ Route: Update a lecture (Admin Only)
 * @method PUT /api/admin/update-lecture/:id
 */
router.put("/update-lecture/:id", verifyAdmin, updateLecture);

/**
 * ✅ Route: Delete a lecture (Admin Only)
 * @method DELETE /api/admin/delete-lecture/:id
 */
router.delete("/delete-lecture/:id", deleteLecture);

export default router;
