import express from "express";
import Feedback from "../models/Feedback.js";
import { isAuth } from "../middlewares/isAuth.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 *  GET Feedback randomly 5 feedbacks
 * URL: /api/feedback/random
 */
router.get("/random", async (req, res) => {
  try {
    console.log("🔍 Fetching Random Feedback");

    const feedback = await Feedback.aggregate([
      { $sample: { size: 5 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { user: { name: 1, email: 1 }, comment: 1, rating: 1 } },
    ]);

    res.status(200).json(feedback);
  } catch (error) {
    console.error(" Error fetching feedback:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 *  GET Feedback for a Specific Course
 * URL: /api/feedback/course/:courseId
 */
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("🔍 Fetching Feedback for Course ID:", courseId);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    const feedback = await Feedback.find({ course: courseId }).populate(
      "user",
      "name email"
    );

    res.status(200).json(feedback);
  } catch (error) {
    console.error(" Error fetching feedback:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 *  POST Submit Feedback for a Course
 * URL: /api/feedback
 */
router.post("/", isAuth, async (req, res) => {
  try {
    const { course, comment, rating } = req.body;
    const user = req.user ? req.user.id : null; // Ensure authentication extracts the user ID

    //  Debugging: Log incoming request body
    console.log(" Received Data:", { course, user, comment, rating });

    if (!course || !comment || !rating || !user) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    const newFeedback = new Feedback({
      course,
      user,
      comment,
      rating,
    });

    await newFeedback.save();
    res.status(201).json({
      message: " Feedback submitted successfully!",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error(" Feedback Submission Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ PUT Edit Feedback
 * URL: /api/feedback/:feedbackId
 */
router.put("/:feedbackId", isAuth, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { comment, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: "Invalid Feedback ID" });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { comment, rating },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res
      .status(200)
      .json({ message: "✅ Feedback updated successfully", feedback });
  } catch (error) {
    console.error("❌ Error editing feedback:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * ✅ DELETE Feedback
 * URL: /api/feedback/:feedbackId
 */
router.delete("/:feedbackId", isAuth, async (req, res) => {
  try {
    const { feedbackId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      return res.status(400).json({ message: "Invalid Feedback ID" });
    }

    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "✅ Feedback deleted successfully" });
  } catch (error) {
    console.error(" Error deleting feedback:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
