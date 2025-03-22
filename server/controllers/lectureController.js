import Lecture from "../models/Lecture.js";
import { Course } from "../models/Course.js";

// Get All Lectures Controller
export const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find().populate("course");
    if (!lectures)
      return res.status(404).json({ message: "No lectures found" });

    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lectures" });
  }
};

// Get Lecture by ID Controller
export const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findById(id).populate("course");
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lecture" });
  }
};

// **Update Lecture Controller**
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, duration, url, content } = req.body;

    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      {
        title,
        description,
        duration,
        type,
        ...(type === "video" && { videoUrl: url, content: null }),
        ...(type === "text" && { content, videoUrl: null }),
      },
      { new: true }
    );

    res.status(200).json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

// **Delete Lecture Controller**
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const lecture = await Lecture.findById(id);
    const course = await Course.findById(lecture.course);

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });
    const deletedLecture = await Lecture.findByIdAndDelete(id);

    if (!deletedLecture)
      return res.status(404).json({ message: "Lecture not found" });

    // remove lecture reference from course
    course.lectures.pull(id);
    await course.save();

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lecture" });
  }
};
