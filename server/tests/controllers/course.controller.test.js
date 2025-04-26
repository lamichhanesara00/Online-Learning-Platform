import { jest } from "@jest/globals";
import { Course } from "../../models/Course.js";
import { createCourse, getAllCourses } from "../../controllers/course.js";

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Course Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Course model methods
    Course.create = jest.fn();
    Course.find = jest.fn();
    Course.findById = jest.fn();
    Course.findOne = jest.fn();
    Course.deleteMany = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a course successfully", async () => {
    const req = {
      body: {
        title: "Test Course",
        description: "This is a test course",
        price: 100,
        category: "Programming",
        instructor: "John Doe",
        duration: 10,
      },
      file: { path: "uploads/test.jpg" },
    };
    const res = mockResponse();

    Course.create.mockResolvedValueOnce({
      _id: 'course123',
      ...req.body,
      image: req.file.path
    });

    await createCourse(req, res);

    expect(Course.create).toHaveBeenCalledWith({
      ...req.body,
      image: req.file.path
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Course created successfully!",
      course: expect.objectContaining({
        title: "Test Course",
        price: 100,
        instructor: "John Doe",
        duration: 10,
        image: "uploads/test.jpg",
      }),
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const req = { body: { title: "Incomplete Course" } }; // Missing required fields
    const res = mockResponse();

    await createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "All fields are required",
    });
  });

  it("should retrieve all courses", async () => {
    Course.find.mockResolvedValueOnce([
      {
        title: "Course 1",
        description: "Desc 1",
        price: 50,
        category: "Cat 1",
        instructor: "Inst 1",
        duration: 5,
      },
      {
        title: "Course 2",
        description: "Desc 2",
        price: 100,
        category: "Cat 2",
        instructor: "Inst 2",
        duration: 10,
      },
    ]);

    const req = {};
    const res = mockResponse();

    await getAllCourses(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: "Course 1" }),
        expect.objectContaining({ title: "Course 2" }),
      ])
    );
  });

  it("should handle errors when retrieving courses", async () => {
    jest.spyOn(Course, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const req = {};
    const res = mockResponse();

    await getAllCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
    });
  });
});
