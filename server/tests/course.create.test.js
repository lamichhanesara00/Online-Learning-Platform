import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Course } from "../models/Course.js";
import { jest } from "@jest/globals";

jest.setTimeout(10000);

describe("🧪 Course Model Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect and stop MongoDB server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean up after each test
    await Course.deleteMany({});
  });

  it("✅ should create and save a course successfully", async () => {
    const validCourse = new Course({
      title: "Introduction to React",
      price: 49.99,
      instructor: "Jane Doe",
      duration: 360, // minutes
      image: "/images/react-course.jpg",
    });

    const savedCourse = await validCourse.save();

    expect(savedCourse._id).toBeDefined();
    expect(savedCourse.title).toBe("Introduction to React");
    expect(savedCourse.price).toBe(49.99);
    expect(savedCourse.instructor).toBe("Jane Doe");
    expect(savedCourse.duration).toBe(360);
    expect(savedCourse.image).toBe("/images/react-course.jpg");
    expect(savedCourse.createdAt).toBeDefined();
    expect(savedCourse.updatedAt).toBeDefined();
    expect(savedCourse.lectures).toEqual([]);
  });

  it("should throw validation error if required fields are missing", async () => {
    const courseWithoutRequiredFields = new Course({
      price: 29.99,
      instructor: "John Smith",
    });

    let err;
    try {
      await courseWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  it("Should allow optional fields to be undefined", async () => {
    const course = new Course({
      title: "JavaScript Basics",
    });

    const savedCourse = await course.save();

    expect(savedCourse.title).toBe("JavaScript Basics");
    expect(savedCourse.price).toBeUndefined();
    expect(savedCourse.instructor).toBeUndefined();
    expect(savedCourse.duration).toBeUndefined();
    expect(savedCourse.image).toBeUndefined();
    expect(savedCourse.lectures).toEqual([]);
  });

  it("should update the updatedAt field when saving", async () => {
    const course = new Course({
      title: "Node.js Fundamentals",
      price: 39.99,
    });

    const savedCourse = await course.save();
    const originalUpdatedAt = savedCourse.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 100));

    savedCourse.price = 44.99;
    const updatedCourse = await savedCourse.save();

    expect(updatedCourse.updatedAt).toBeDefined();
    expect(updatedCourse.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it("✅ should store lectures as an array of ObjectIds", async () => {
    const lectureId1 = new mongoose.Types.ObjectId();
    const lectureId2 = new mongoose.Types.ObjectId();

    const course = new Course({
      title: "MongoDB Advanced",
      lectures: [lectureId1, lectureId2],
    });

    const savedCourse = await course.save();

    expect(savedCourse.lectures).toHaveLength(2);
    expect(String(savedCourse.lectures[0])).toBe(String(lectureId1));
    expect(String(savedCourse.lectures[1])).toBe(String(lectureId2));
  });

  it("✅ should allow adding lectures after creation", async () => {
    const course = new Course({
      title: "GraphQL Masterclass",
    });

    const savedCourse = await course.save();
    expect(savedCourse.lectures).toHaveLength(0);

    // Add lectures
    const lectureId = new mongoose.Types.ObjectId();
    savedCourse.lectures.push(lectureId);
    const updatedCourse = await savedCourse.save();

    expect(updatedCourse.lectures).toHaveLength(1);
    expect(String(updatedCourse.lectures[0])).toBe(String(lectureId));
  });
});
