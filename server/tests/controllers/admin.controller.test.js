import { jest } from "@jest/globals";
import * as adminController from "../../controllers/admin.js";
import { Course } from "../../models/Course.js";
import { User } from "../../models/User.js";
import { Admin } from "../../models/Admin.js";
import Lecture from "../../models/Lecture.js";

jest.setTimeout(10000);

const mockCourse = {
  prototype: {
    save: jest.fn(),
  },
  createCourse: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};

const mockLecture = {
  create: jest.fn(),
};

const mockUser = {
  find: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockAdmin = {
  find: jest.fn(),
};

jest.unstable_mockModule("../../models/Course.js", () => ({
  Course: mockCourse,
}));

jest.unstable_mockModule("../../models/Lecture.js", () => ({
  default: mockLecture,
}));

jest.unstable_mockModule("../../models/User.js", () => ({
  User: mockUser,
}));

jest.unstable_mockModule("../../models/Admin.js", () => ({
  Admin: mockAdmin,
}));

describe("Admin Controller Tests", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
  });
  describe("addLectures", () => {
    beforeEach(() => {
      req = {
        params: {
          id: "mockedCourseId",
        },
        body: {
          title: "Test Lecture",
          description: "Test Description",
          type: "video",
          duration: 30,
          url: "https://example.com/video.mp4",
        },
      };

      Course.findById = jest.fn().mockResolvedValue({
        _id: "mockedCourseId",
        lectures: [],
        save: jest.fn().mockResolvedValue(true),
      });

      Lecture.create = jest.fn().mockResolvedValue({
        _id: "mockedLectureId",
        title: "Test Lecture",
        description: "Test Description",
        type: "video",
        duration: 30,
        videoUrl: "https://example.com/video.mp4",
        course: "mockedCourseId",
      });
    });

    it("should add a video lecture successfully", async () => {
      await adminController.addLectures(req, res);

      expect(Course.findById).toHaveBeenCalledWith("mockedCourseId");
      expect(Lecture.create).toHaveBeenCalledWith({
        title: "Test Lecture",
        description: "Test Description",
        course: "mockedCourseId",
        duration: 30,
        type: "video",
        videoUrl: "https://example.com/video.mp4",
      });

      expect(
        Course.findById("mockedCourseId").then((course) => {
          expect(course.lectures).toContain("mockedLectureId");
          expect(course.save).toHaveBeenCalled();
        })
      );

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should add a text lecture successfully", async () => {
      req.body.type = "text";
      req.body.content = "This is a text lecture content";
      delete req.body.url;

      Lecture.create = jest.fn().mockResolvedValue({
        _id: "mockedLectureId",
        title: "Test Lecture",
        description: "Test Description",
        type: "text",
        content: "This is a text lecture content",
        course: "mockedCourseId",
      });

      await adminController.addLectures(req, res);

      expect(Lecture.create).toHaveBeenCalledWith({
        title: "Test Lecture",
        description: "Test Description",
        course: "mockedCourseId",
        duration: 30,
        type: "text",
        content: "This is a text lecture content",
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 404 if course is not found", async () => {
      Course.findById = jest.fn().mockResolvedValue(null);

      await adminController.addLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No course with this id",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      req.body.title = undefined;

      await adminController.addLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lecture title, description, and type are required",
      });
    });

    it("should handle errors and return 500", async () => {
      Course.findById = jest.fn().mockRejectedValue(new Error("Test error"));

      await adminController.addLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "Test error",
      });
    });
  });

  describe("getUsers", () => {
    beforeEach(() => {
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([
          { _id: "user1", name: "User 1", email: "user1@example.com" },
          { _id: "user2", name: "User 2", email: "user2@example.com" },
        ]),
      });

      Admin.find = jest.fn().mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue([
            { _id: "admin1", name: "Admin 1", email: "admin1@example.com" },
          ]),
      });
    });

    it("should return all users and admins", async () => {
      await adminController.getUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(Admin.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { _id: "user1", name: "User 1", email: "user1@example.com" },
        { _id: "user2", name: "User 2", email: "user2@example.com" },
        { _id: "admin1", name: "Admin 1", email: "admin1@example.com" },
      ]);
    });

    it("should handle errors and return 500", async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      await adminController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "Test error",
      });
    });
  });

  describe("deleteUser", () => {
    beforeEach(() => {
      req = {
        params: {
          id: "userId123",
        },
      };

      User.findByIdAndDelete = jest.fn().mockResolvedValue({
        _id: "userId123",
        name: "Deleted User",
      });
    });

    it("should delete a user successfully", async () => {
      await adminController.deleteUser(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith("userId123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should return 404 if user is not found", async () => {
      User.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await adminController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle errors and return 500", async () => {
      User.findByIdAndDelete = jest
        .fn()
        .mockRejectedValue(new Error("Test error"));

      await adminController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "Test error",
      });
    });
  });
});
