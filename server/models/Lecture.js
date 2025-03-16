import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  type: { type: String, required: true },
  videoUrl: { type: String },
  content: { type: String },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

const Lecture = mongoose.model("Lecture", lectureSchema);
export default Lecture;
