import { Course } from "../models/Course.js";

// ✅ Create Course Function
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, instructor, duration } = req.body;

    if (!title || !description || !price || !category || !instructor || !duration) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = new Course({
      title,
      description,
      price: Number(price),
      category,
      instructor,
      duration: Number(duration),
      image: req.file ? req.file.path : "uploads/default.jpg",
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully!", course: newCourse });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get All Courses Function
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Ensure module exports all functions
export default {
  createCourse,
  getAllCourses
};
