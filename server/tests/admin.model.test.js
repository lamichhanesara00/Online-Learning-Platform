import mongoose from "mongoose"
import { Admin } from "../models/Admin.js"
import dotenv from "dotenv"
import { jest } from "@jest/globals" // ✅ Important fix

jest.setTimeout(15000) // ⏰ Give MongoDB & hashing time

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
  await Admin.deleteMany()
})

describe("🧪 Admin Model", () => {
  it("✅ should create an admin successfully", async () => {
    const adminData = {
      name: "Test Admin",
      email: "testadmin@example.com",
      password: "securepassword",
    }

    const admin = new Admin(adminData)
    const savedAdmin = await admin.save()

    expect(savedAdmin._id).toBeDefined()
    expect(savedAdmin.email).toBe(adminData.email)
    expect(savedAdmin.role).toBe("admin")
    expect(savedAdmin.isVerified).toBe(true)
  })

  it("❌ should not allow duplicate email", async () => {
    const adminData = {
      name: "Aphrodite Admin",
      email: "aphro@test.com",
      password: "test1234",
    }

    await Admin.create(adminData)

    await expect(Admin.create(adminData)).rejects.toThrow(/duplicate key error/)
  })
})
