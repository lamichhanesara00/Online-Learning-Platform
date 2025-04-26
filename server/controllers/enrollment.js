import Enrollment from "../models/Enrollment.js";
import { Course } from "../models/Course.js";
import Lecture from "../models/Lecture.js";
import Progress from "../models/progress.js";
import mongoose from "mongoose";

export const saveEnrollmentDb = async (details) => {
  console.log(details);
  try {
    const enrollment = await Enrollment.create({
      course: details.courseId,
      user: details.userId,
      isPaid: true,
      paidAt: new Date(),
      paymentMethod: details.paymentMethod,
      paymentId: details.paymentId,
    });

    console.log({
      enrollment
    })

    const lectures = await Lecture.find({
      course: enrollment.course,
    });

    // Create a new progress record for the user
    const progress = await Progress.create({
      studentId: enrollment.user,
      courseId: enrollment.course,
      totalLectures: lectures.length,
    });

    return { enrollment };
  } catch (error) {
    throw new Error("Failed to save enrollment");
  }
};

export const createEnrollment = async (req, res) => {
  try {
    const { course: courseId, user: userId, paymentMethod, paymentId } = req.body;

    if (!courseId || !userId) {
      return res
        .status(400)
        .json({ message: "Course and user IDs are required" });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      course: courseId,
      user: userId,
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "User is already enrolled in this course" });
    }

    const enrolled = await saveEnrollmentDb({
      courseId,
      userId,
      isPaid: true,
      paidAt: new Date(),
      paymentMethod: paymentMethod || "direct",
      paymentId: paymentId || `PAY-${Math.random().toString(36).substring(2, 15)}`,
    });

    res.status(201).json({
      message: "Enrollment successful",
      enrollment: enrolled,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to enroll in the course",
      error: error.message,
    });
  }
};

export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: "course",
        select: "title image duration instructor",
        populate: {
          path: "lectures",
          model: "Lecture",
        },
      })
      .sort({ enrolledAt: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    res.status(500).json({
      message: "Failed to fetch enrollments",
      error: error.message,
    });
  }
};

export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const enrollment = await Enrollment.findById(id)
      .populate({
        path: "course",
        populate: {
          path: "lectures",
          model: "Lecture",
        },
      })
      .populate("user", "name email");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollment details:", error);
    res.status(500).json({
      message: "Failed to fetch enrollment details",
      error: error.message,
    });
  }
};

export const checkEnrollment = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ message: "Invalid user ID or course ID" });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    const isEnrolled = !!enrollment;

    res.status(200).json({ isEnrolled, enrollment });
  } catch (error) {
    console.error("Error checking enrollment status:", error);
    res.status(500).json({
      message: "Failed to check enrollment status",
      error: error.message,
    });
  }
};

export const getUserCoursesWithProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find all enrollments for the user
    const enrollments = await Enrollment.find({ user: userId }).populate({
      path: "course",
      populate: {
        path: "lectures",
      },
    });

    // Get progress information for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Find progress for this course
        const progress = await Progress.findOne({
          studentId: userId,
          courseId: enrollment.course._id,
        });

        // Calculate progress percentage
        const totalLectures = enrollment.course.lectures.length;
        const completedLectures = progress
          ? progress.completedLectures.length
          : 0;
        const progressPercentage =
          totalLectures > 0
            ? Math.round((completedLectures / totalLectures) * 100)
            : 0;

        // Find the most recent completed lecture to continue from
        let lastCompletedLectureId = null;
        let nextLectureToWatch = null;

        if (progress && progress.completedLectures.length > 0) {
          lastCompletedLectureId =
            progress.completedLectures[progress.completedLectures.length - 1];

          // Find the next lecture to watch
          if (enrollment.course.lectures.length > 0) {
            const lectureIds = enrollment.course.lectures.map((lecture) =>
              lecture._id.toString()
            );
            const lastCompletedIndex = lectureIds.findIndex(
              (id) => id === lastCompletedLectureId.toString()
            );

            if (lastCompletedIndex < lectureIds.length - 1) {
              nextLectureToWatch =
                enrollment.course.lectures[lastCompletedIndex + 1];
            }
          }
        } else if (enrollment.course.lectures.length > 0) {
          // If no lectures completed yet, start with the first one
          nextLectureToWatch = enrollment.course.lectures[0];
        }

        return {
          enrollment: enrollment,
          progress: {
            completedLectures,
            totalLectures,
            progressPercentage,
            lastCompletedLectureId,
            nextLectureToWatch,
          },
        };
      })
    );

    res.status(200).json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching user courses with progress:", error);
    res.status(500).json({
      message: "Failed to fetch courses with progress",
      error: error.message,
    });
  }
};
