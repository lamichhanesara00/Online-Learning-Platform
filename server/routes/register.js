import express from "express";
import { registerAdmin } from "../controllers/register.js"; // ✅ Ensure correct path

const router = express.Router();

/**
 * ✅ POST /api/admin/register (Admin Registration)
 * - Allows admin to create an account
 */
router.post("/", registerAdmin);

export default router;
