import express from "express";
import { loginAdmin } from "../controllers/login.js"; // ✅ Ensure correct path

const router = express.Router();

/**
 * ✅ POST /api/admin/login (Admin Login)
 * - Allows admin to log in
 */
router.post("/", loginAdmin);

export default router;
