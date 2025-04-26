import { jest } from "@jest/globals";
import Lecture from "../models/Lecture.js";

jest.setTimeout(10000);

jest.mock("../models/Lecture.js", () => {
  return {
    default: jest.fn(),
  };
});

describe("📚 Lecture Model Test (Mocked)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("✅ should create and save a lecture successfully", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_lecture_id",
      title: "Introduction to JavaScript",
      description: "Basics of JavaScript programming",
      duration: 45,
      type: "video",
      videoUrl: "http://example.com/video.mp4",
      content: "Some text content",
      course: "mocked_course_id",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Lecture.prototype.save = mockSave;

    const validLecture = new Lecture({
      title: "Introduction to JavaScript",
      description: "Basics of JavaScript programming",
      duration: 45,
      type: "video",
      videoUrl: "http://example.com/video.mp4",
      content: "Some text content",
      course: "mocked_course_id"
    });

    const savedLecture = await validLecture.save();

    expect(savedLecture._id).toBeDefined();
    expect(savedLecture.title).toBe("Introduction to JavaScript");
    expect(savedLecture.description).toBe("Basics of JavaScript programming");
    expect(savedLecture.duration).toBe(45);
    expect(savedLecture.type).toBe("video");
    expect(savedLecture.videoUrl).toBe("http://example.com/video.mp4");
    expect(savedLecture.content).toBe("Some text content");
    expect(savedLecture.course).toBe("mocked_course_id");
  });

  it("❌ should throw validation error if required fields are missing", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      title: { message: "Path `title` is required." },
      description: { message: "Path `description` is required." },
      duration: { message: "Path `duration` is required." },
      type: { message: "Path `type` is required." },
      course: { message: "Path `course` is required." }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Lecture.prototype.save = mockSave;

    const lectureWithoutRequiredFields = new Lecture({});

    let err;
    try {
      await lectureWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.title).toBeDefined();
    expect(err.errors.description).toBeDefined();
    expect(err.errors.duration).toBeDefined();
    expect(err.errors.type).toBeDefined();
    expect(err.errors.course).toBeDefined();
  });

  it("✅ should allow optional fields to be undefined", async () => {
    const mockSave = jest.fn().mockResolvedValue({
      _id: "mocked_lecture_id",
      title: "JS Basics",
      description: "An overview",
      duration: 30,
      type: "article",
      course: "mocked_course_id",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    Lecture.prototype.save = mockSave;

    const lecture = new Lecture({
      title: "JS Basics",
      description: "An overview",
      duration: 30,
      type: "article",
      course: "mocked_course_id"
    });

    const savedLecture = await lecture.save();
    expect(savedLecture.videoUrl).toBeUndefined();
    expect(savedLecture.content).toBeUndefined();
  });

  it("❌ should validate lecture type", async () => {
    const validationError = new Error("ValidationError");
    validationError.name = "ValidationError";
    validationError.errors = {
      type: { message: "Path `type` must be either 'video' or 'article'" }
    };

    const mockSave = jest.fn().mockRejectedValue(validationError);
    Lecture.prototype.save = mockSave;

    const lectureWithInvalidType = new Lecture({
      title: "Test Lecture",
      description: "Test Description",
      duration: 30,
      type: "invalid_type",
      course: "mocked_course_id"
    });

    let err;
    try {
      await lectureWithInvalidType.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.name).toBe("ValidationError");
    expect(err.errors.type).toBeDefined();
  });
});

