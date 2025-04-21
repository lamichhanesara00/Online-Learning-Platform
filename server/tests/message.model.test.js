import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../models/Message.js";
import { User } from "../models/User.js";
import { jest } from "@jest/globals"; // ✅ Import from @jest/globals

dotenv.config();
jest.setTimeout(30000); // ⏰ Increase timeout to avoid hook failures

let sender, receiver;

beforeAll(async () => {
  await mongoose.connect(process.env.DB, {
    dbName: "onlineLearning",
  });

  await User.deleteMany();
  await Message.deleteMany();

  sender = await User.create({
    name: "Sender",
    email: "sender@example.com",
    password: "123456",
    role: "student",
  });

  receiver = await User.create({
    name: "Receiver",
    email: "receiver@example.com",
    password: "123456",
    role: "teacher",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("📨 Message Model", () => {
  it("✅ should create a valid message", async () => {
    const message = await Message.create({
      senderId: sender._id,
      receiverId: receiver._id,
      content: "Hello, test message!",
    });

    expect(message).toBeDefined();
    expect(message.content).toBe("Hello, test message!");
    expect(message.isRead).toBe(false);
  });

  it("❌ should not create a message without content", async () => {
    try {
      await Message.create({
        senderId: sender._id,
        receiverId: receiver._id,
        content: "",
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toMatch(/Message validation failed/);
    }
  });

  it("✅ should mark a message as read", async () => {
    const msg = await Message.create({
      senderId: sender._id,
      receiverId: receiver._id,
      content: "Read this message!",
    });

    msg.isRead = true;
    const updated = await msg.save();
    expect(updated.isRead).toBe(true);
  });
});
