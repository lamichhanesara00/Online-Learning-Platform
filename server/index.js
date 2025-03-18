import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import createCourseRoutes from "./routes/createcourse.js"; // Use createCourse route
import chatRoutes from "./routes/chat.js";
import studentRoutes from "./routes/student.js";
import feedbackRoutes from "./routes/feedback.js";
import adminRegisterRoutes from "./routes/register.js";
import adminLoginRoutes from "./routes/login.js";
import lectureRoutes from "./routes/lecture.js";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name (required when using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
connectDB().catch((error) => {
  console.error("MongoDB Connection Failed:", error);
  process.exit(1);
});

// Register Routes
app.use("/api/user", userRoutes);
// app.use("/api/course", courseRoutes);
app.use("/api/admin/register", adminRegisterRoutes);
app.use("/api/admin/login", adminLoginRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", lectureRoutes);

app.use(createCourseRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
