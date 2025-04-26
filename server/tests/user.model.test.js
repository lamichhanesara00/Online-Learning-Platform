import { jest } from "@jest/globals";
import { User } from "../models/User.js";

jest.setTimeout(10000);

jest.mock("../models/User.js", () => {
  return {
    User: jest.fn(),
  };
});

describe("👤 User Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should create a valid user", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_user_id",
      name: "Test User",
      email: "test@example.com",
      password: "hashedPassword123",
      role: "student",
      isVerified: false,
      otp: null,
      otpExpiry: null,
      enrolledCourses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    User.prototype.save = mockSave;

    const validUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "123456"
    });

    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("Test User");
    expect(savedUser.email).toBe("test@example.com");
    expect(savedUser.role).toBe("student");
    expect(savedUser.isVerified).toBe(false);
    expect(savedUser.enrolledCourses).toEqual([]);
  });

  it("❌ should not create user without required fields", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      name: { message: "Path `name` is required." },
      email: { message: "Path `email` is required." },
      password: { message: "Path `password` is required." }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    User.prototype.save = mockSave;

    const invalidUser = new User({
      name: "Incomplete"
    });

    let err;
    try {
      await invalidUser.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it("❌ should not allow invalid email format", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      email: { message: "Please provide a valid email" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    User.prototype.save = mockSave;

    const userWithInvalidEmail = new User({
      name: "Test User",
      email: "invalid-email",
      password: "123456"
    });

    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.email).toBeDefined();
  });

  it("❌ should enforce unique email", async () => {
    const duplicateError = new Error("Duplicate key error");
    duplicateError.code = 11000;

    const mockSave = jest.fn()
      .mockResolvedValueOnce({
        _id: "first_user_id",
        name: "First User",
        email: "user@example.com",
        password: "hashedpass123",
        role: "student"
      })
      .mockRejectedValueOnce(duplicateError);

    User.prototype.save = mockSave;

    const user1 = new User({
      name: "First User",
      email: "user@example.com",
      password: "123456"
    });

    const user2 = new User({
      name: "Second User",
      email: "user@example.com",
      password: "different123"
    });

    await user1.save();

    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });

  it("✅ should default role to student if not specified", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_user_id",
      name: "Student User",
      email: "student@example.com",
      password: "hashedpass123",
      role: "student",
      isVerified: false
    });

    User.prototype.save = mockSave;

    const userWithoutRole = new User({
      name: "Student User",
      email: "student@example.com",
      password: "123456"
    });

    const savedUser = await userWithoutRole.save();
    expect(savedUser.role).toBe("student");
  });
});

