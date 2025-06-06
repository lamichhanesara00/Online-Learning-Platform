import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import createCourseRoutes from "./routes/createcourse.js"; // Use createCourse route
import chatRoutes from "./routes/chat.js";
import adminRoute from "./routes/adminRoute.js";
import paymentRoute from "./routes/payment.js";
import studentRoutes from "./routes/student.js";
import progressRoutes from "./routes/progress.js";
import feedbackRoutes from "./routes/feedback.js";
import adminRegisterRoutes from "./routes/register.js";
import adminLoginRoutes from "./routes/login.js";
import lectureRoutes from "./routes/lecture.js";
import enrollmentRoutes from "./routes/enrollement.js"; // Add enrollment route
import { Server } from "socket.io";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

// Get directory name (required when using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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
app.use("/api/admin/register", adminRegisterRoutes);
app.use("/api/admin/login", adminLoginRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/courses", createCourseRoutes);
app.use("/api/payments", paymentRoute);

app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found" });
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("setup", ({ _id, role }) => {
    console.log("User setup:", _id, "as", role);

    socket.join(_id);

    if (role !== "student") {
      socket.join(role);
    }
  });

  socket.on("sendMessage", (message) => {
    console.log("Received message:", message);
    if (message.senderRole === "student") {
      io.to("admin").emit("receiveMessage", message);
    } else {
      socket.to(message.receiverId).emit("receiveMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server using httpServer.listen so Socket.IO works correctly
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});


