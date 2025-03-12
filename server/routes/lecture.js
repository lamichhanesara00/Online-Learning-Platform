import express from "express";
import { addLecture, getLectures, updateLecture, deleteLecture } from "../controllers/lectureController.js";
import { verifyAdmin } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

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
router.delete("/delete-lecture/:id", verifyAdmin, deleteLecture);

export default router;
