import { expect, jest } from "@jest/globals";
import Progress from "../../models/progress.js";
import { Course } from "../../models/Course.js";
import { getStudentProgress, updateStudentProgress, getStudentAllProgress, trackLectureTime } from "../../controllers/progress.js";
import mongoose from "mongoose";

describe("Progress Controller", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockObjectId = new mongoose.Types.ObjectId();

  const TEST_COURSE = {
    _id: mockObjectId,
    title: "Test Course",
    lectures: [
      { _id: new mongoose.Types.ObjectId(), title: "Lecture 1" },
      { _id: new mongoose.Types.ObjectId(), title: "Lecture 2" }
    ]
  };

  const TEST_PROGRESS = {
    _id: new mongoose.Types.ObjectId(),
    studentId: new mongoose.Types.ObjectId(),
    courseId: TEST_COURSE._id,
    completedLectures: [TEST_COURSE.lectures[0]],
    lastAccessedLecture: TEST_COURSE.lectures[0],
    timeSpent: 30,
    save: jest.fn().mockResolvedValue(true)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Progress.findOne = jest.fn();
    Course.findById = jest.fn();
    Progress.find = jest.fn();
  });

  describe("getStudentProgress", () => {
    it("gets student progress successfully for existing progress", async () => {
      Course.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(TEST_COURSE)
      }));
      
      Progress.findOne.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(TEST_PROGRESS)
        }))
      }));

      const req = {
        params: {
          studentId: TEST_PROGRESS.studentId.toString(),
          courseId: TEST_COURSE._id.toString()
        }
      };
      const res = mockResponse();

      await getStudentProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        progress: TEST_PROGRESS,
        course: expect.any(Object),
        stats: expect.any(Object)
      });
    });

    it("returns 404 when course not found", async () => {
      Course.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null)
      }));

      const req = {
        params: {
          studentId: TEST_PROGRESS.studentId.toString(),
          courseId: TEST_COURSE._id.toString()
        }
      };
      const res = mockResponse();

      await getStudentProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Course not found"
      });
    });
  });

  describe("updateStudentProgress", () => {
    it("updates progress successfully for new progress", async () => {
      Progress.findOne.mockResolvedValue(null);
      Course.findById.mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(TEST_COURSE)
      }));

      const mockNewProgress = {
        ...TEST_PROGRESS,
        completedLectures: [TEST_COURSE.lectures[0]._id]
      };
      Progress.prototype.save = jest.fn().mockResolvedValue(mockNewProgress);

      const req = {
        body: {
          studentId: TEST_PROGRESS.studentId.toString(),
          courseId: TEST_COURSE._id.toString(),
          lectureId: TEST_COURSE.lectures[0]._id.toString(),
          timeSpent: 30
        }
      };
      const res = mockResponse();

      await updateStudentProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Progress updated successfully",
        progress: expect.any(Object),
        stats: expect.any(Object)
      });
    });

    it("fails with invalid IDs", async () => {
      const req = {
        body: {
          studentId: "invalid-id",
          courseId: "invalid-id",
          lectureId: "invalid-id"
        }
      };
      const res = mockResponse();

      await updateStudentProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid ID format"
      });
    });
  });

  describe("getStudentAllProgress", () => {
    it("gets all progress records successfully", async () => {
      const mockProgressList = [TEST_PROGRESS];
      Progress.find.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce(mockProgressList)
          }))
        }))
      }));

      const req = {
        params: {
          studentId: TEST_PROGRESS.studentId.toString()
        }
      };
      const res = mockResponse();

      await getStudentAllProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns empty array when no progress found", async () => {
      Progress.find.mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockResolvedValueOnce([])
          }))
        }))
      }));

      const req = {
        params: {
          studentId: TEST_PROGRESS.studentId.toString()
        }
      };
      const res = mockResponse();

      await getStudentAllProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("trackLectureTime", () => {
    it("tracks lecture time successfully", async () => {
      Progress.findOne.mockResolvedValue(TEST_PROGRESS);

      const req = {
        body: {
          studentId: TEST_PROGRESS.studentId.toString(),
          courseId: TEST_COURSE._id.toString(),
          lectureId: TEST_COURSE.lectures[0]._id.toString(),
          timeSpent: 15
        }
      };
      const res = mockResponse();

      await trackLectureTime(req, res);

      expect(TEST_PROGRESS.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("fails with missing required fields", async () => {
      const req = {
        body: {
          studentId: TEST_PROGRESS.studentId.toString()
          // missing courseId and lectureId
        }
      };
      const res = mockResponse();

      await trackLectureTime(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});