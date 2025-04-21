import mongoose from "mongoose"
import dotenv from "dotenv"
import { jest } from "@jest/globals"
import Enrollment from "../models/Enrollment.js"

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
  await Enrollment.deleteMany()
})

describe("🎓 Enrollment Model", () => {
  it("✅ should create an enrollment successfully", async () => {
    const enrollment = new Enrollment({
      user: new mongoose.Types.ObjectId(),
      course: new mongoose.Types.ObjectId(),
      paymentMethod: "khalti",
      paymentId: "khalti_987654321",
      isPaid: true,
      paidAt: new Date(),
    })

    const saved = await enrollment.save()

    expect(saved._id).toBeDefined()
    expect(saved.isPaid).toBe(true)
    expect(saved.paymentMethod).toBe("khalti")
    expect(saved.enrolledAt).toBeDefined()
  })

  it("❌ should fail if course or user is missing", async () => {
    const badEnrollment = new Enrollment({})

    let error
    try {
      await badEnrollment.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.message).toMatch(/course|user/)
  })

  it("✅ should default isPaid to false", async () => {
    const enrollment = new Enrollment({
      course: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
    })

    const saved = await enrollment.save()

    expect(saved.isPaid).toBe(false)
    expect(saved.enrolledAt).toBeDefined()
  })
})
