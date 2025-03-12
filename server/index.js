import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import chatRoutes from "./routes/chat.js";
import studentRoutes from "./routes/student.js";
import feedbackRoutes from "./routes/feedback.js"; 
import adminRegisterRoutes from "./routes/register.js";
import adminLoginRoutes from "./routes/login.js";

dotenv.config(); // ✅ Load environment variables

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// ✅ Connect to MongoDB
connectDB().catch((error) => {
    console.error(" MongoDB Connection Failed:", error);
    process.exit(1); // Exit process if DB fails to connect
});

// ✅ Register API Routes
app.use("/api/user", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/admin/register", adminRegisterRoutes);
app.use("/api/admin/login", adminLoginRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/course/:courseId/feedback", feedbackRoutes); // ✅ FIXED: Correct Route

// ✅ Catch-all for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: " Route Not Found" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on: http://localhost:${PORT}`);
});
