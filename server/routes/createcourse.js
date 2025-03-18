import express from "express";
import { uploadFiles } from "../middlewares/multer.js";
import CreateCourse from "../models/createCourse.js";
import { Course } from "../models/Course.js";

const router = express.Router();

// ✅ POST: Create a new course
router.post("/api/courses", uploadFiles.single("image"), async (req, res) => {
  const { title, instructor, duration, price } = req.body;
  const image = req.file ? req.file.path : null;

  if (!image) {
    return res.status(400).json({ message: "Image is required." });
  }

  try {
    const newCourse = new Course({
      title,
      instructor,
      duration,
      price,
      image,
    });

    await newCourse.save();
    res.status(201).json({ message: "Course Created Successfully!" });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Failed to create course." });
  }
});

// GET: Fetch all courses
router.get("/api/course/all", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// GET: Fetch all courses
router.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// GET: Fetch course by ID for editing
router.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course." });
  }
});

// PUT: Update course details
router.put(
  "/api/courses/:id",
  uploadFiles.single("image"),
  async (req, res) => {
    const { title, instructor, duration, price } = req.body;
    const image = req.file ? req.file.path : undefined;

    try {
      const updateData = { title, instructor, duration, price };
      if (image) updateData.image = image;

      await Course.findByIdAndUpdate(req.params.id, updateData);
      res.status(200).json({ message: "Course Updated Successfully!" });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course." });
    }
  }
);

// DELETE: Delete a course by ID
router.delete("/api/courses/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Course Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course." });
  }
});

export default router;
