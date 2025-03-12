// models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  instructor: { type: String },
  category: { type: String },
  duration: { type: Number }, // store numeric duration
  image: { type: String },    // store the file path if you upload an image

  // Lectures array references the Lecture model
  lectures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
    },
  ],

  // Optional: track creation/update times
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Optional pre-save hook to update 'updatedAt'
courseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Course = mongoose.model("Course", courseSchema);
