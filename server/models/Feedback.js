import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

export default Feedback;
