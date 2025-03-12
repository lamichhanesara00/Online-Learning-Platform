import express from "express";
import Feedback from "../models/Feedback.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { isAuth } from "../middlewares/isAuth.js"; // ✅ Ensure this middleware extracts req.user correctly

dotenv.config();
const router = express.Router();

/**
 * ✅ GET Feedback for a Specific Course
 * URL: /api/course/:courseId/feedback
 */
router.get("/:courseId/feedback", async (req, res) => {  // ✅ FIXED: Added :courseId
  try {
    const { courseId } = req.params;

    console.log("🔍 Received Course ID:", courseId); // ✅ Debugging step

    // ✅ Validate Course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    // ✅ Fetch feedback
    const feedback = await Feedback.find({ course: courseId }).populate("user", "name email");

    if (!feedback.length) {
      return res.status(404).json({ message: "No feedback found for this course." });
    }

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ POST Submit Feedback for a Course
 * URL: /api/course/:courseId/feedback
 * Protected Route: Requires authentication
 */
router.post("/:courseId/feedback", isAuth, async (req, res) => {  // ✅ FIXED: Added :courseId
  try {
    const { courseId } = req.params;
    const { comment, rating } = req.body;
    const user = req.user.id; // ✅ Extract user from JWT token

    console.log("📝 Submitting Feedback for Course ID:", courseId); // ✅ Debugging step

    if (!comment || !rating) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // ✅ Validate Course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    // ✅ Create new feedback
    const newFeedback = new Feedback({
      course: courseId,
      user,
      comment,
      rating
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully!", feedback: newFeedback });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ PUT Edit Feedback
 * URL: /api/course/:courseId/feedback/:feedbackId
 * Protected Route: Requires authentication
 */
router.put("/:courseId/feedback/:feedbackId", isAuth, async (req, res) => { // ✅ FIXED
  try {
    const { feedbackId } = req.params;
    const { comment, rating } = req.body;

    // ✅ Validate Feedback ID
    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: "Invalid Feedback ID" });
    }

    // ✅ Update feedback
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { comment, rating },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback updated successfully", feedback });
  } catch (error) {
    console.error("Error editing feedback:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ DELETE Feedback
 * URL: /api/course/:courseId/feedback/:feedbackId
 * Protected Route: Requires authentication
 */
router.delete("/:courseId/feedback/:feedbackId", isAuth, async (req, res) => { // ✅ FIXED
  try {
    const { feedbackId } = req.params;

    // ✅ Validate Feedback ID
    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: "Invalid Feedback ID" });
    }

    // ✅ Delete feedback
    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
