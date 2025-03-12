import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const router = express.Router();

// ✅ Fetch messages between two users
router.get("/:userId/:receiverId", async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
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
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
});

// ✅ Send message
router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty" });
    }
    if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ success: false, message: "Invalid User ID format" });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
});

export default router;
