import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import dotenv from "dotenv"
import { jest } from "@jest/globals"
import request from "supertest"
import fs from "fs"
import path from "path"
import { Course } from "../models/Course.js"

jest.setTimeout(20000)
dotenv.config()

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/"
    if (!fs.existsSync(dest)) fs.mkdirSync(dest)
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})
const upload = multer({ storage })

// ✅ Mini Express App with course creation route
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))

app.post("/api/courses", upload.single("image"), async (req, res) => {
  const { title, instructor, duration, price } = req.body
  const image = req.file ? req.file.path : null

  if (!image) return res.status(400).json({ message: "Image is required." })

  try {
    const newCourse = new Course({
      title,
      instructor,
      duration: Number(duration), // ✅ Ensure duration is stored as a number
      price,
      image,
    })
    await newCourse.save()
    res.status(201).json({ message: "Course Created Successfully!" })
  } catch (err) {
    console.error("❌ Error creating course:", err.message)
    res.status(500).json({ message: "Failed to create course." })
  }
})

// ✅ Setup DB
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
  await Course.deleteMany()
})

// ✅ Tests
describe("📚 Create Course API", () => {
  it("✅ should create a course with image and valid fields", async () => {
    const res = await request(app)
      .post("/api/courses")
      .field("title", "React Bootcamp")
      .field("instructor", "Aphrodite")
      .field("duration", "6") // ✅ Fixed from "6 weeks"
      .field("price", "799")
      .attach("image", path.resolve("tests/sample.jpg"))

    expect(res.statusCode).toBe(201)
    expect(res.body.message).toBe("Course Created Successfully!")

    const created = await Course.findOne({ title: "React Bootcamp" })
    expect(created).toBeDefined()
  })

  it("❌ should fail if image is missing", async () => {
    const res = await request(app)
      .post("/api/courses")
      .field("title", "Missing Image")
      .field("instructor", "Ghost")
      .field("duration", "3")
      .field("price", "299")

    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe("Image is required.")
  })

  it("❌ should fail if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/courses")
      .field("title", "")
      .field("duration", "6")
      .field("price", "799")
      .attach("image", path.resolve("tests/sample.jpg"))

    expect(res.statusCode).toBe(500)
    expect(res.body.message).toBe("Failed to create course.")
  })
})
