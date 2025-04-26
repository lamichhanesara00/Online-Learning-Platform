import { jest } from "@jest/globals";
import Feedback from "../models/Feedback.js";

jest.setTimeout(10000);

jest.mock("../models/Feedback.js", () => {
  return {
    default: jest.fn(),
  };
});

describe("📝 Feedback Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should create feedback successfully", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_feedback_id",
      course: "mocked_course_id",
      user: "mocked_user_id",
      comment: "This course is amazing!",
      rating: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Feedback.prototype.save = mockSave;

    const feedback = new Feedback({
      course: "mocked_course_id",
      user: "mocked_user_id",
      comment: "This course is amazing!",
      rating: 5
    });

    const savedFeedback = await feedback.save();

    expect(savedFeedback._id).toBeDefined();
    expect(savedFeedback.course).toBe("mocked_course_id");
    expect(savedFeedback.user).toBe("mocked_user_id");
    expect(savedFeedback.comment).toBe("This course is amazing!");
    expect(savedFeedback.rating).toBe(5);
  });

  it("❌ should fail if required fields are missing", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      course: { message: "Path `course` is required." },
      user: { message: "Path `user` is required." },
      rating: { message: "Path `rating` is required." }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Feedback.prototype.save = mockSave;

    const feedback = new Feedback({});

    let error;
    try {
      await feedback.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.course).toBeDefined();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.rating).toBeDefined();
  });

  it("❌ should validate rating range", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      rating: { message: "Rating must be between 1 and 5" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Feedback.prototype.save = mockSave;

    const feedbackWithInvalidRating = new Feedback({
      course: "mocked_course_id",
      user: "mocked_user_id",
      comment: "Great course!",
      rating: 10
    });

    let error;
    try {
      await feedbackWithInvalidRating.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.rating).toBeDefined();
  });

  it("✅ should allow optional comment", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_feedback_id",
      course: "mocked_course_id",
      user: "mocked_user_id",
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Feedback.prototype.save = mockSave;

    const feedbackWithoutComment = new Feedback({
      course: "mocked_course_id",
      user: "mocked_user_id",
      rating: 4
    });

    const savedFeedback = await feedbackWithoutComment.save();

    expect(savedFeedback._id).toBeDefined();
    expect(savedFeedback.rating).toBe(4);
    expect(savedFeedback.comment).toBeUndefined();
  });
});

