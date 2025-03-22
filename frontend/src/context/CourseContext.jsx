import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const server = "http://localhost:5000"; // ✅ Adjust if needed
const CourseContext = createContext(); // ✅ Create Course Context

export const CourseContextProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** ✅ Fetch Courses */
  async function fetchCourses() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${server}/api/courses/all`); // ✅ Fetching all courses
      setCourses(data);
    } catch (error) {
      console.error(
        "❌ Error fetching courses:",
        error.response?.data || error.message
      );
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }

  /** ✅ Fetch Lectures by Course ID */
  async function fetchLectures(courseId) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${server}/api/course/${courseId}/lectures`
      ); // ✅ Fetching lectures for the course
      setLectures(data);
    } catch (error) {
      console.error(
        "❌ Error fetching lectures:",
        error.response?.data || error.message
      );
      setError("Failed to load lectures.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fetch courses when the component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <CourseContext.Provider
      value={{ courses, lectures, loading, error, fetchCourses, fetchLectures }}
    >
      {children}
    </CourseContext.Provider>
  );
};

// ✅ Custom Hook to use Course and Lecture Data
export const useCourseData = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error(
      "useCourseData must be used within a CourseContextProvider"
    );
  }
  return context;
};
