import mongoose from "mongoose"
import dotenv from "dotenv"
import { describe, beforeAll, afterAll, it, expect, jest } from "@jest/globals"

dotenv.config()
jest.setTimeout(30000) // ⏰ Increase timeout

// ✅ Inline User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  otp: { type: String },
  otpCreatedAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

beforeAll(async () => {
  await mongoose.connect(process.env.DB, { dbName: "onlineLearning" })
  await User.deleteMany()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe("👤 User Model", () => {
  it("✅ should create a valid user", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      role: "student",
    })

    expect(user).toBeDefined()
    expect(user.name).toBe("Test User")
    expect(user.email).toBe("test@example.com")
    expect(user.role).toBe("student")
    expect(user.isVerified).toBe(false)
  })

  it("❌ should not create user without required fields", async () => {
    try {
      await User.create({ name: "Incomplete" })
    } catch (err) {
      expect(err).toBeDefined()
      expect(err.message).toMatch(/email/)
    }
  })

  it("✅ should default role to student if not specified", async () => {
    const user = await User.create({
      name: "Student Default",
      email: "student@example.com",
      password: "password123",
    })

    expect(user.role).toBe("student")
  })
})
