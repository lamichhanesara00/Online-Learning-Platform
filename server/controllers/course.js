import { Course } from "../models/Course.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, instructor, duration } =
      req.body;

    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !instructor ||
      !duration
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = await Course.create({
      title,
      description,
      price: Number(price),
      category,
      instructor,
      duration: Number(duration),
      image: req.file ? req.file.path : "uploads/default.jpg",
    });

    res
      .status(201)
      .json({ message: "Course created successfully!", course: newCourse });
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  createCourse,
  getAllCourses,
};
