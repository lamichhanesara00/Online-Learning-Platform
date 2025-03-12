import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],
  totalLectures: { type: Number, required: true },
});

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
