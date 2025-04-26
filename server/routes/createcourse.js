import express from "express";
import { uploadFiles } from "../middlewares/multer.js";
import { Course } from "../models/Course.js";
import Lecture from "../models/Lecture.js";

const router = express.Router();
// PUT: Update course details
router.put("/:id", uploadFiles.single("image"), async (req, res) => {
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
});

/**
 * ADD LECTURES
 * Expects: title, description, video in req.body
 * Param: :id for the course ID
 */
router.post("/:id/lecture", async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log("🚀 ~ addLectures ~ courseId:", courseId);

    // 1) Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "No course with this id" });
    }

    const { title, description, type, duration, videoUrl, content } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({
        message: "Lecture title, description, and type are required",
      });
    }

    // 2) Create a new Lecture doc
    const newLecture = await Lecture.create({
      title,
      description,
      course: courseId, // link the lecture to the course
      duration,
      type,
      ...(type === "video" && { videoUrl }),
      ...(type === "text" && { content }),
    });

    // 3) Associate the lecture with the course
    course.lectures.push(newLecture._id);
    await course.save();

    return res.status(201).json({
      message: "Lecture added successfully!",
      lecture: newLecture,
      course,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});
// ✅ POST: Create a new course
router.post("/", uploadFiles.single("image"), async (req, res) => {
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
router.get("/all", async (req, res) => {
  try {
    const courses = await Course.find().populate("lectures");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// GET: Fetch all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("lectures");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses." });
  }
});

// GET: Fetch course by ID for editing
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("lectures");
    if (!course) return res.status(404).json({ message: "Course not found." });
    res.status(200).json(course);
  } catch (error) {
    console.log("Error fetching course:", error);
    res.status(500).json({ message: "Failed to fetch course." });
  }
});

// DELETE: Delete a course by ID
router.delete("/:id", async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Course Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course." });
  }
});

export default router;
