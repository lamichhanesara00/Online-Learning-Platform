import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import { User } from "../models/User.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

/**
 * @route   GET /api/chat/students
 * @desc    Get all students who have conversations with the teacher
 * @access  Private (Teachers only)
 */
router.get("/students", isAuth, async (req, res) => {
  try {
    console.log("Fetching students with conversations");
    console.log("User ID:", req.user);
    const teacherId = req.user._id;

    // Find all unique student IDs who have had conversations with this teacher
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: teacherId }, { receiverId: teacherId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", teacherId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageDate: { $max: "$createdAt" },
          lastMessage: { $last: "$$ROOT" },
        },
      },
      { $sort: { lastMessageDate: -1 } },
    ]);

    // Collect all student IDs from conversations
    const studentIds = conversations.map((conv) => conv._id);

    // Fetch the student details
    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
    }).select("_id name email profilePicture");

    // Count unread messages for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Find conversation data for this student
        const conversation = conversations.find(
          (conv) => conv._id.toString() === student._id.toString()
        );

        // Count unread messages from this student to the teacher
        const unreadCount = await Message.countDocuments({
          senderId: student._id,
          receiverId: teacherId,
          isRead: { $ne: true },
        });

        // Format the last message
        let lastMessage = null;
        if (conversation && conversation.lastMessage) {
          lastMessage = {
            _id: conversation.lastMessage._id,
            content: conversation.lastMessage.content,
            createdAt: conversation.lastMessage.createdAt,
            senderId: conversation.lastMessage.senderId,
            receiverId: conversation.lastMessage.receiverId,
          };
        }

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          profilePicture: student.profilePicture,
          unreadCount,
          lastMessage,
        };
      })
    );

    // Sort by last message date (most recent first)
    studentsWithDetails.sort((a, b) => {
      const dateA = a.lastMessage
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const dateB = b.lastMessage
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return dateB - dateA;
    });

    res.status(200).json({
      success: true,
      data: studentsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching students with conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chat/messages/:studentId
 * @desc    Get messages between teacher and a specific student
 * @access  Private (Teachers only)
 */
router.get("/messages/:studentId", isAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.id;

    // Validate student ID
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    // Ensure the user is a teacher
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can access this resource",
      });
    }

    // Verify the student exists
    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Fetch messages between teacher and student
    const messages = await Message.find({
      $or: [
        { senderId: teacherId, receiverId: studentId },
        { senderId: studentId, receiverId: teacherId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages from student as read
    await Message.updateMany(
      { senderId: studentId, receiverId: teacherId, isRead: { $ne: true } },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/chat/messages
 * @desc    Send a message to a student
 * @access  Private (Teachers only)
 */
router.post("/messages", isAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // Validate required fields
    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    if (!mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID format",
      });
    }

    // Ensure the user is a teacher
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only teachers can send messages through this endpoint",
      });
    }

    // Verify the receiver is a student
    const student = await User.findOne({
      _id: receiverId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create and save the new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      isRead: false,
    });

    // Populate the message with sender and receiver details
    const populatedMessage = await Message.findById(newMessage._id);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Keep the existing endpoints
// ✅ Fetch messages between two users
router.get("/:userId/:receiverId", isAuth, async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

// ✅ Send message
router.post("/", isAuth, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Message content cannot be empty" });
    }
    if (
      !mongoose.isValidObjectId(senderId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID format" });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/chat/teachers
 * @desc    Get all teachers with or without conversations with the student
 * @access  Private (Students only)
 */
router.get("/teachers", isAuth, async (req, res) => {
  console.log("Fetching teachers with conversations");
  try {
    // Ensure the user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this resource",
      });
    }

    const studentId = req.user.id;

    // Find all unique teacher IDs who have had conversations with this student
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: studentId }, { receiverId: studentId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", studentId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessageDate: { $max: "$createdAt" },
          lastMessage: { $last: "$$ROOT" },
        },
      },
      { $sort: { lastMessageDate: -1 } },
    ]);

    // Create a map of conversation data by teacher ID
    const conversationMap = {};
    conversations.forEach((conv) => {
      if (conv._id) {
        conversationMap[conv._id.toString()] = {
          lastMessageDate: conv.lastMessageDate,
          lastMessage: conv.lastMessage,
        };
      }
    });

    // Fetch ALL teachers regardless of conversation history
    const allTeachers = await User.find({
      role: "teacher",
    }).select("_id name email profilePicture");

    // Process teacher data to include conversation details if they exist
    const teachersWithDetails = await Promise.all(
      allTeachers.map(async (teacher) => {
        const teacherId = teacher._id.toString();
        const conversationData = conversationMap[teacherId];

        // Count unread messages (only if there are conversations)
        const unreadCount = conversationData
          ? await Message.countDocuments({
              senderId: teacher._id,
              receiverId: studentId,
              isRead: { $ne: true },
            })
          : 0;

        // Format the last message (if exists)
        let lastMessage = null;
        if (conversationData && conversationData.lastMessage) {
          lastMessage = {
            _id: conversationData.lastMessage._id,
            content: conversationData.lastMessage.content,
            createdAt: conversationData.lastMessage.createdAt,
            senderId: conversationData.lastMessage.senderId,
            receiverId: conversationData.lastMessage.receiverId,
          };
        }

        // Determine if this teacher has an active conversation
        const hasConversation = conversationData ? true : false;

        return {
          _id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          profilePicture: teacher.profilePicture,
          unreadCount,
          lastMessage,
          hasConversation,
        };
      })
    );

    // Sort teachers: first those with conversations (by last message date), then those without
    teachersWithDetails.sort((a, b) => {
      // If both have conversations, sort by message date
      if (a.hasConversation && b.hasConversation) {
        const dateA = a.lastMessage
          ? new Date(a.lastMessage.createdAt)
          : new Date(0);
        const dateB = b.lastMessage
          ? new Date(b.lastMessage.createdAt)
          : new Date(0);
        return dateB - dateA;
      }

      // If only one has conversation, prioritize that one
      if (a.hasConversation) return -1;
      if (b.hasConversation) return 1;

      // If neither has conversation, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({
      success: true,
      data: teachersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
});

export default router;
