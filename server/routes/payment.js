import express from "express";
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "../controllers/payment.js";

const router = express.Router();

// Routes for /api/payments
router.post("/khalti/initiate", initiateKhaltiPayment);
router.post("/khalti/verify", verifyKhaltiPayment);

export default router;
