import { jest } from "@jest/globals";
import Lecture from "../../models/Lecture.js";
import { Course } from "../../models/Course.js";
import {
  getLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
} from "../../controllers/lectureController.js";

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.setTimeout(10000);
describe("Lecture Controller", () => {
  let testCourse;
  let testLecture;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock test data
    testCourse = {
      _id: 'course123',
      title: "Test Course",
      description: "Test Description",
      price: 99.99,
      category: "Programming",
      instructor: "John Doe",
      duration: 120,
    };

    testLecture = {
      _id: 'lecture123',
      title: "Test Lecture",
      description: "Test Lecture Description",
      duration: 60,
      type: "video",
      videoUrl: "https://example.com/video.mp4",
      course: testCourse._id,
    };

    // Mock Course model methods
    Course.create = jest.fn();
    Course.findById = jest.fn();
    Course.findOne = jest.fn();
    Course.save = jest.fn();

    // Mock Lecture model methods
    Lecture.create = jest.fn();
    Lecture.find = jest.fn();
    Lecture.findById = jest.fn();
    Lecture.findByIdAndUpdate = jest.fn();
    Lecture.findByIdAndDelete = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getLectures", () => {
    it("should get all lectures for a course", async () => {
      const req = {
        params: { courseId: testCourse._id },
      };
      const res = mockResponse();

      Lecture.find.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue([testLecture]),
        };
      });

      await getLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([testLecture]);
    });
  });

  describe("getLectureById", () => {
    it("should get lecture by id", async () => {
      const req = {
        params: { id: testLecture._id },
      };
      const res = mockResponse();

      Lecture.findById.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue(testLecture),
        };
      });

      await getLectureById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(testLecture);
    });

    it("should return 404 if lecture not found", async () => {
      const req = {
        params: { id: 'nonexistent' },
      };
      const res = mockResponse();

      Lecture.findById.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue(null),
        };
      });

      await getLectureById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Lecture not found" });
    });
  });

  describe("updateLecture", () => {
    it("should update lecture successfully", async () => {
      const updatedData = {
        title: "Updated Lecture",
        description: "Updated Description",
      };
      const req = {
        params: { id: testLecture._id },
        body: updatedData,
      };
      const res = mockResponse();

      Course.findById.mockImplementationOnce(() => {
        return {
          ...testCourse,
          lectures: {
            pull: jest.fn().mockResolvedValue(testCourse)
          },
          save: jest.fn().mockResolvedValue(testCourse)
        };
      });


      Lecture.findById.mockImplementationOnce(() => {
        return {
          ...testLecture
        };
      });

      Lecture.findByIdAndUpdate.mockImplementationOnce(() => {
        return {...updatedData}
      });

      const updatedLecture = { ...testLecture, ...updatedData };
      await updateLecture(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Lecture.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        "title": "Updated Lecture",
        "description": "Updated Description"
      });
    });
  });

  describe("deleteLecture", () => {
    it("should delete lecture successfully", async () => {
      const req = {
        params: { id: testLecture._id },
      };
      const res = mockResponse();

      Course.findById.mockImplementationOnce(() => {
        return {
          ...testCourse,
          lectures: {
            pull: jest.fn().mockResolvedValue(testCourse)
          },
          save: jest.fn().mockResolvedValue(testCourse)
        };
      });

      Lecture.findById.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue(testLecture)
        };
      });

      Lecture.findByIdAndDelete.mockResolvedValueOnce(testLecture);

      await deleteLecture(req, res);

      expect(Lecture.findByIdAndDelete).toHaveBeenCalledWith(testLecture._id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Lecture deleted successfully" });
    });
  });

  describe("getLectures", () => {
    it("should get all lectures", async () => {
      const req = {};
      const res = mockResponse();

      Lecture.find.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue([testLecture]),
        };
      });

      await getLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Test Lecture",
            description: "Test Lecture Description",
          }),
        ])
      );
    });

    it("should handle errors", async () => {
      const req = {};
      const res = mockResponse();

      // Mock Lecture.find to throw an error
      const mockFind = jest.spyOn(Lecture, "find").mockImplementation(() => {
        throw new Error("DB Error");
      });

      await getLectures(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch lectures",
      });

      // Restore the mock
      mockFind.mockRestore();
    });
  });

  describe("getLectureById", () => {
    it("should get lecture by id", async () => {
      const req = {
        params: { id: testLecture._id.toString() },
      };
      const res = mockResponse();

      Lecture.findById.mockImplementationOnce(() => {
        return {
          populate: jest.fn().mockResolvedValue(testLecture),
        };
      });

      await getLectureById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Lecture",
          description: "Test Lecture Description",
        })
      );
    });
  });
});
