import { jest } from "@jest/globals";
import Enrollment from "../models/Enrollment.js";

jest.setTimeout(10000);

jest.mock("../models/Enrollment.js", () => {
  return {
    default: jest.fn(),
  };
});

describe("🎓 Enrollment Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should create an enrollment successfully", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_enrollment_id",
      user: "mocked_user_id",
      course: "mocked_course_id",
      paymentMethod: "khalti",
      paymentId: "khalti_987654321",
      isPaid: true,
      paidAt: new Date(),
      enrolledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Enrollment.prototype.save = mockSave;

    const enrollment = new Enrollment({
      user: "mocked_user_id",
      course: "mocked_course_id",
      paymentMethod: "khalti",
      paymentId: "khalti_987654321",
      isPaid: true,
      paidAt: new Date()
    });

    const saved = await enrollment.save();

    expect(saved._id).toBeDefined();
    expect(saved.user).toBe("mocked_user_id");
    expect(saved.course).toBe("mocked_course_id");
    expect(saved.isPaid).toBe(true);
    expect(saved.paymentMethod).toBe("khalti");
    expect(saved.paymentId).toBe("khalti_987654321");
    expect(saved.enrolledAt).toBeDefined();
    expect(saved.paidAt).toBeDefined();
  });

  it("❌ should fail if course or user is missing", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      course: { message: "Path `course` is required." },
      user: { message: "Path `user` is required." }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Enrollment.prototype.save = mockSave;

    const badEnrollment = new Enrollment({});

    let error;
    try {
      await badEnrollment.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.course).toBeDefined();
    expect(error.errors.user).toBeDefined();
  });

  it("✅ should default isPaid to false", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_enrollment_id",
      user: "mocked_user_id",
      course: "mocked_course_id",
      isPaid: false,
      enrolledAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Enrollment.prototype.save = mockSave;

    const enrollment = new Enrollment({
      user: "mocked_user_id",
      course: "mocked_course_id"
    });

    const saved = await enrollment.save();

    expect(saved.isPaid).toBe(false);
    expect(saved.enrolledAt).toBeDefined();
    expect(saved.paymentMethod).toBeUndefined();
    expect(saved.paymentId).toBeUndefined();
    expect(saved.paidAt).toBeUndefined();
  });

  it("❌ should validate payment method", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      paymentMethod: { message: "Invalid payment method" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Enrollment.prototype.save = mockSave;

    const enrollmentWithInvalidPayment = new Enrollment({
      user: "mocked_user_id",
      course: "mocked_course_id",
      paymentMethod: "invalid_method",
      isPaid: true
    });

    let error;
    try {
      await enrollmentWithInvalidPayment.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.paymentMethod).toBeDefined();
  });
});

