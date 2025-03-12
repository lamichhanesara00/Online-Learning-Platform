import Progress from "../models/progress.js";
import Lecture from "../models/Lecture.js";

// ✅ Fetch Student Progress
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const progress = await Progress.findOne({ studentId }).populate("completedLectures");

    if (!progress) {
      return res.status(404).json({ message: "❌ No progress found for this student." });
    }

    const progressPercentage = progress.totalLectures > 0
      ? (progress.completedLectures.length / progress.totalLectures) * 100
      : 0;

    res.status(200).json({ ...progress.toObject(), progressPercentage });
  } catch (error) {
    console.error("❌ Error fetching progress:", error);
    res.status(500).json({ message: "❌ Error fetching progress", error });
  }
};

// ✅ Update Student Progress (Mark a lecture as completed)
export const updateStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId, lectureId } = req.body;

    if (!studentId || !courseId || !lectureId) {
      return res.status(400).json({ message: "❌ Missing required fields." });
    }

    let progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      const totalLectures = await Lecture.countDocuments({ courseId });
      progress = new Progress({ studentId, courseId, completedLectures: [], totalLectures });
    }

    // Check if the lecture is already marked as completed
    if (!progress.completedLectures.includes(lectureId)) {
      progress.completedLectures.push(lectureId);
    }

    await progress.save();
    res.status(200).json({ message: "✅ Progress updated successfully", progress });
  } catch (error) {
    console.error("❌ Error updating progress:", error);
    res.status(500).json({ message: "❌ Error updating progress", error });
  }
};
