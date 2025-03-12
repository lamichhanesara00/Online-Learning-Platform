import express from "express";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";

const router = express.Router();

// ✅ Enroll a student in a course (Only Students)
router.post("/enroll", async (req, res) => {
    try {
        const { studentEmail, courseId } = req.body;

        // ✅ Check if user exists
        const user = await User.findOne({ email: studentEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ Ensure the user is a student
        if (user.role !== "student") {
            return res.status(403).json({ message: "Only students can enroll in courses" });
        }

        // ✅ Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ studentEmail, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        // ✅ Enroll student
        const newEnrollment = new Enrollment({ studentEmail, courseId });
        await newEnrollment.save();

        res.status(201).json({ message: "Enrolled successfully", enrollment: newEnrollment });
    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
