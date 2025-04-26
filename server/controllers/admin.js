import Lecture from "../models/Lecture.js";
import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Admin } from "../models/Admin.js";

/**
 * CREATE COURSE
 * Expects: title, description, price, instructor, category, duration
 * Optional file (cover image) from Multer in req.file
 */
export const createCourse = async (req, res) => {
  try {
    const { title, description, price, instructor, category, duration } =
      req.body;

    // Validate fields
    if (
      !title ||
      !description ||
      !price ||
      !instructor ||
      !category ||
      !duration
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If using Multer, the uploaded file is in req.file
    // If no file, set a default or null
    const image = req.file ? req.file.path : "uploads/default.jpg";

    // Convert duration to a number if needed
    const numericDuration = Number(duration);
    if (isNaN(numericDuration)) {
      return res
        .status(400)
        .json({ message: "Duration must be a valid number" });
    }

    // Create a new course
    const newCourse = new Course({
      title,
      description,
      price: Number(price),
      instructor,
      category,
      duration: numericDuration,
      image,
    });

    await newCourse.save();

    return res.status(201).json({
      message: "Course created successfully!",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * ADD LECTURES
 * Expects: title, description, video in req.body
 * Param: :id for the course ID
 */
export const addLectures = async (req, res) => {
  try {
    const courseId = req.params.id;

    // 1) Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "No course with this id" });
    }

    const { title, description, type, duration, url, content } = req.body;
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
      ...(type === "video" && { videoUrl: url }),
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
};

/**
 * GET ALL USERS
 * Returns all users and admins
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const admins = await Admin.find().select("-password");

    return res.status(200).json([...users, ...admins]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Delete a user by ID
 * Param: :id for the user ID
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
