// In tests/lecture.test.js
import request from 'supertest';
import app from '../index.js';  // Default import for the app
import mongoose from 'mongoose';
import { Course } from '../models/Course';
import Lecture from '../models/Lecture';

jest.setTimeout(15000);

// MongoDB connection setup for testing
beforeAll(async () => {
  await mongoose.connect(process.env.DB, {
    serverSelectionTimeoutMS: 5000,
    dbName: 'onlineLearningTest',  // Use a test database
  });
});

// Close MongoDB connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Clean up the database before each test
beforeEach(async () => {
  await Lecture.deleteMany();
  await Course.deleteMany();
});

describe("🎥 Lecture Routes Tests", () => {
  // Test POST /api/lectures - Create a lecture
  it("✅ should create a lecture with valid fields", async () => {
    const dummyCourse = await Course.create({
      title: "Node Basics",
      instructor: "Aphrodite",
      duration: 4,
      price: 299,
      image: "uploads/sample.jpg",
    });

    const lectureData = {
      title: "Intro to Node.js",
      description: "Getting started with Node",
      duration: 45,
      type: "video",
      videoUrl: "https://videos.com/node-intro.mp4",
      course: dummyCourse._id,
    };

    const res = await request(app)
      .post("/api/lectures")
      .send(lectureData);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Lecture created successfully");
    expect(res.body.lecture.title).toBe("Intro to Node.js");
    expect(res.body.lecture.course.toString()).toBe(dummyCourse._id.toString());
  });

  // More tests...
});
