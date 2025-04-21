import mongoose from "mongoose"
import { jest } from "@jest/globals"
import dotenv from "dotenv"
import Lecture from "../models/Lecture.js"
import { Course } from "../models/Course.js"

dotenv.config()
jest.setTimeout(15000)

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
  await Lecture.deleteMany()
  await Course.deleteMany()
})

describe("🎥 Lecture Model", () => {
  it("✅ should create a lecture with all required fields", async () => {
    const dummyCourse = await Course.create({
      title: "Node Basics",
      instructor: "Aphrodite",
      duration: 4,
      price: 299,
      image: "uploads/sample.jpg",
    })

    const lecture = await Lecture.create({
      title: "Intro to Node.js",
      description: "Getting started with Node",
      duration: 45,
      type: "video",
      videoUrl: "https://videos.com/node-intro.mp4",
      course: dummyCourse._id,
    })

    expect(lecture.title).toBe("Intro to Node.js")
    expect(lecture.type).toBe("video")
    expect(lecture.course.toString()).toBe(dummyCourse._id.toString())
  })

  it("❌ should fail if required fields are missing", async () => {
    try {
      await Lecture.create({
        description: "No title",
        duration: 30,
        type: "text",
      })
    } catch (err) {
      expect(err).toBeDefined()
      expect(err.errors.title).toBeDefined()
    }
  })
})
