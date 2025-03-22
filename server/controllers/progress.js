import Progress from "../models/progress.js";
import { Course } from "../models/Course.js";
import Lecture from "../models/Lecture.js";
import mongoose from "mongoose";

// Get progress for a specific student and course
export const getStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ message: "Invalid student or course ID" });
    }

    // Find the course to get total lectures
    const course = await Course.findById(courseId).populate("lectures");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find or initialize progress
    let progress = await Progress.findOne({ studentId, courseId })
      .populate("completedLectures")
      .populate("lastAccessedLecture");

    console.log("🚀 ~ getStudentProgress ~ Progress:", progress);

    if (!progress) {
      // Create a new progress record if none exists
      progress = new Progress({
        studentId,
        courseId,
        completedLectures: [],
        timeSpent: 0,
      });
      await progress.save();
    }

    // Calculate progress percentage
    const totalLectures = course.lectures.length;
    const completedLectures = progress.completedLectures.length;

    const progressPercentage =
      totalLectures > 0
        ? Math.round((completedLectures / totalLectures) * 100)
        : 0;

    // Determine next lecture to watch
    let nextLectureToWatch = null;
    if (course.lectures.length > 0) {
      if (progress.lastAccessedLecture) {
        // Find the index of the last accessed lecture
        const lastAccessedIndex = course.lectures.findIndex(
          (lecture) =>
            lecture._id.toString() ===
            progress.lastAccessedLecture._id.toString()
        );

        if (lastAccessedIndex < course.lectures.length - 1) {
          // Return the next lecture after the last accessed one
          nextLectureToWatch = course.lectures[lastAccessedIndex + 1];
        }
      }

      if (!nextLectureToWatch) {
        // If no last accessed lecture or it was the last one, find first incomplete lecture
        nextLectureToWatch = course.lectures.find(
          (lecture) =>
            !progress.completedLectures.some(
              (completedLecture) =>
                completedLecture._id.toString() === lecture._id.toString()
            )
        );

        // If all lectures are completed, suggest the first one
        if (!nextLectureToWatch && course.lectures.length > 0) {
          nextLectureToWatch = course.lectures[0];
        }
      }
    }

    res.status(200).json({
      progress,
      course: {
        _id: course._id,
        title: course.title,
        totalLectures,
        lectures: course.lectures,
      },
      stats: {
        completedLectures,
        totalLectures,
        progressPercentage,
        nextLectureToWatch,
      },
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch progress", error: error.message });
  }
};

// Mark a lecture as completed
export const updateStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId, lectureId, timeSpent } = req.body;

    // Validate required fields
    if (!studentId || !courseId || !lectureId) {
      return res.status(400).json({
        message: "Student ID, course ID, and lecture ID are required",
      });
    }

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lectureId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find or create progress record
    let progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      // Get course to validate lectureId
      const course = await Course.findById(courseId).populate("lectures");

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const lectureExists = course.lectures.some(
        (lecture) => lecture._id.toString() === lectureId
      );

      if (!lectureExists) {
        return res
          .status(404)
          .json({ message: "Lecture not found in this course" });
      }

      // Create new progress record
      progress = new Progress({
        studentId,
        courseId,
        completedLectures: [lectureId],
        lastAccessedLecture: lectureId,
        lastAccessedAt: new Date(),
        timeSpent: timeSpent || 0,
      });
    } else {
      // Update existing progress

      // Update last accessed lecture
      progress.lastAccessedLecture = lectureId;
      progress.lastAccessedAt = new Date();

      // Add to completed lectures if not already there
      if (!progress.completedLectures.includes(lectureId)) {
        progress.completedLectures.push(lectureId);
      }

      // Update time spent if provided
      if (timeSpent && !isNaN(timeSpent)) {
        progress.timeSpent += Number(timeSpent);
      }
    }

    await progress.save();

    // Get course to calculate progress percentage
    const course = await Course.findById(courseId);
    const totalLectures = course.lectures.length;
    const progressPercentage =
      totalLectures > 0
        ? Math.round((progress.completedLectures.length / totalLectures) * 100)
        : 0;

    res.status(200).json({
      message: "Progress updated successfully",
      progress,
      stats: {
        completedLectures: progress.completedLectures.length,
        totalLectures,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res
      .status(500)
      .json({ message: "Failed to update progress", error: error.message });
  }
};

// Get all progress records for a student (all courses)
export const getStudentAllProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    console.log("Fetching progress for student:", studentId);

    const progressRecords = await Progress.find({ studentId })
      .populate({
        path: "courseId",
        select: "title image instructor duration lectures",
        populate: {
          path: "lectures",
          select: "_id title",
        },
      })
      .populate("completedLectures", "_id title")
      .populate("lastAccessedLecture", "_id title");

    console.log("Progress records:", progressRecords);

    const coursesWithProgress = progressRecords.map((record) => {
      const course = record.courseId;
      const totalLectures = course?.lectures?.length;
      const completedLectures = record?.completedLectures?.length;

      return {
        course: course
          ? {
              _id: course._id,
              title: course.title,
              image: course.image,
              instructor: course.instructor,
              duration: course.duration,
              totalLectures,
            }
          : null,
        progress: {
          _id: record._id,
          completedLectures: record.completedLectures,
          lastAccessedLecture: record.lastAccessedLecture,
          lastAccessedAt: record.lastAccessedAt,
          timeSpent: record.timeSpent,
          completedCount: completedLectures,
          progressPercentage:
            totalLectures > 0
              ? Math.round((completedLectures / totalLectures) * 100)
              : 0,
        },
      };
    });

    res.status(200).json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching student's progress:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch progress data", error: error.message });
  }
};

// Track time spent on a lecture
export const trackLectureTime = async (req, res) => {
  try {
    const { studentId, courseId, lectureId, timeSpent } = req.body;

    if (!studentId || !courseId || !lectureId || timeSpent === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      progress = new Progress({
        studentId,
        courseId,
        completedLectures: [],
        lastAccessedLecture: lectureId,
        lastAccessedAt: new Date(),
        timeSpent: timeSpent,
      });
    } else {
      progress.lastAccessedLecture = lectureId;
      progress.lastAccessedAt = new Date();
      progress.timeSpent += Number(timeSpent);
    }

    await progress.save();

    res.status(200).json({
      message: "Time tracked successfully",
      timeSpent: progress.timeSpent,
    });
  } catch (error) {
    console.error("Error tracking lecture time:", error);
    res
      .status(500)
      .json({ message: "Failed to track time", error: error.message });
  }
};
