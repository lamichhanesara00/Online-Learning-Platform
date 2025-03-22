import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLectures: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Lecture" },
    ],
    lastAccessedLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
    lastAccessedAt: { type: Date, default: Date.now },
    // Track time spent on course in minutes
    timeSpent: { type: Number, default: 0 },
    totalLectures: { type: Number, required: true },
  },
  { timestamps: true }
);

// Create a compound index for faster lookups
progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
