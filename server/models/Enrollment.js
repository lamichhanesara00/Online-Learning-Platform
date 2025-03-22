import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentId: { type: String },
  paymentMethod: { type: String },
  enrolledAt: { type: Date, default: Date.now },
});

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

export default Enrollment;
