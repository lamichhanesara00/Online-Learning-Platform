import mongoose from "mongoose"
import dotenv from "dotenv"
import { jest } from "@jest/globals"
import Feedback from "../models/Feedback.js"

jest.setTimeout(15000)
dotenv.config()

beforeAll(async () => {
  await mongoose.connect(process.env.DB, {
    serverSelectionTimeoutMS: 5000,
    dbName: "onlineLearning",
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await Feedback.deleteMany()
})

describe("📝 Feedback Model", () => {
  it("✅ should create feedback successfully", async () => {
    const feedback = new Feedback({
      course: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      comment: "This course is amazing!",
      rating: 5,
    })

    const savedFeedback = await feedback.save()

    expect(savedFeedback._id).toBeDefined()
    expect(savedFeedback.comment).toBe("This course is amazing!")
    expect(savedFeedback.rating).toBe(5)
  })

  it("❌ should fail if required fields are missing", async () => {
    const feedback = new Feedback({})

    let error
    try {
      await feedback.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.message).toMatch(/Feedback validation failed/)
  })
})
