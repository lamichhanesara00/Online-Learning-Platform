import express from "express";
import { verifyAdmin } from "../middlewares/authMiddleware.js";
import { getAdminProfile } from "../controllers/adminprofile.js";
import { getUsers, deleteUser } from "../controllers/admin.js";

const router = express.Router();

router.get("/users", verifyAdmin, getUsers);

router.get("/profile", verifyAdmin, getAdminProfile);

router.delete("/users/:id", deleteUser);

export default router;
