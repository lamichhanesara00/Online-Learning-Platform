import { expect, jest } from "@jest/globals";
import Enrollment from "../../models/Enrollment.js";
import {Course} from "../../models/Course.js";
import Lecture from "../../models/Lecture.js";
import Progress from "../../models/progress.js";
import {
  createEnrollment,
  getUserEnrollments,
} from "../../controllers/enrollment.js";
import mongoose from "mongoose";

jest.setTimeout(10000);
// Mock axios properly
jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Enrollment Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Course.create = jest.fn();
    Course.findById = jest.fn();
    Course.insertOne = jest.fn();
    Course.save = jest.fn();

    Lecture.find = jest.fn();
    Lecture.findById = jest.fn();
    Lecture.insertOne = jest.fn();
    Lecture.save = jest.fn();

    Progress.findOne = jest.fn();
    Progress.insertOne = jest.fn();
    Progress.save = jest.fn();

    Enrollment.create = jest.fn();
    Enrollment.find = jest.fn();
    Enrollment.insertOne = jest.fn();
    Enrollment.findOne = jest.fn();
    Enrollment.save = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an enrollment successfully", async () => {
    const course = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Course",
      description: "This is a test course",
      price: 100,
      category: "Programming",
      instructor: "John Doe",
      duration: 10,
    }

    const userId = new mongoose.Types.ObjectId("680c89075b0c47f9f86ccb14");
    const req = {
      body: {
        course: course._id,
        user: userId,
        paymentMethod: "direct",
        paymentId: "PAY-123",
      },
    };
    const res = mockResponse();
    const enrollment = {
      _id: new mongoose.Types.ObjectId(),
      course: course._id,
      user: userId,
      isPaid: true,
      paidAt: new Date()
    };

    Enrollment.create.mockResolvedValueOnce(() => {
      return {
        ...enrollment,
        user: userId
      }
    });
    Enrollment.insertOne.mockResolvedValueOnce(() => {
      return {
        ...enrollment,
        user: userId
      }
    });
    Course.findById.mockImplementationOnce(() => {
      return {
        ...course
      };
    });

    Lecture.find.mockResolvedValueOnce([]);
    Progress.findOne.mockResolvedValueOnce(() => ({
      studentId: userId,
      courseId: course._id,
      totalLectures: 0,
    }));
    Progress.insertOne.mockResolvedValueOnce(() => ({
      _id: new mongoose.Types.ObjectId(),
      studentId: userId,
      courseId: course._id,
      totalLectures: 0,
    }));

    Progress.save.mockResolvedValueOnce(() => ({
      _id: new mongoose.Types.ObjectId(),
      studentId: userId,
      courseId: course._id,
      totalLectures: 0,
    }));

    await createEnrollment(req, res);

    expect(Course.findById).toHaveBeenCalledWith(course._id);
    expect(Enrollment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        course: course._id,
        user: userId,
        isPaid: true,
      })
    );
    // expect(res.status).toHaveBeenCalledWith(201);
    // expect(res.json).toHaveBeenCalledWith({
    //   message: "Enrolled successfully",
    //   enrollment
    // });
  });

  it("should return 400 if required fields are missing", async () => {
    const req = {
      body: { courseId: 'course123' },
    };
    const res = mockResponse();

    await createEnrollment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Course and user IDs are required",
    });
  });

  it("should retrieve all enrollments for a user", async () => {
    const userId = new mongoose.Types.ObjectId();
    const enrollments = [
      {
        _id: new mongoose.Types.ObjectId(),
        course: new mongoose.Types.ObjectId(),
        user: new mongoose.Types.ObjectId(),
        isPaid: true,
        paidAt: new Date()
      }
    ];

    Enrollment.find.mockImplementationOnce(() => {
      return {
        populate: jest.fn().mockImplementationOnce(() => {
          return {
          sort: jest.fn().mockResolvedValueOnce(enrollments)
          }
        })
      }
    });

    const req = { params: { userId } };
    const res = mockResponse();

    await getUserEnrollments(req, res);

    // expect(Enrollment.find).toHaveBeenCalledWith({ user: userId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(enrollments);
  });

  it("should return 400 for invalid user ID in getUserEnrollments", async () => {
    const req = { params: { userId: "invalid-id" } };
    const res = mockResponse();

    await getUserEnrollments(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid user ID",
    });
  });

});
