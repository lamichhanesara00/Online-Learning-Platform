import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaComments,
  FaSearch,
  FaFilter,
  FaStar,
} from "react-icons/fa";
import "./courses.css";
import { useUserData } from "../../context/UserContext";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const { userRole, user, isAuth } = useUserData();

  const navigate = useNavigate();
  const isTeacher = userRole === "teacher";
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";

  const fetchUserEnrolledCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/enrollments/user/" + user._id
      );
      setEnrolledCourses(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      setError("Failed to load enrolled courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (isAuth && isStudent && user._id) {
      fetchUserEnrolledCourses();
    }
  }, [isAuth, isStudent, user]);

  useEffect(() => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        const isEnrolled = enrolledCourses.some(
          (enrollment) => enrollment?.course?._id === course?._id
        );
        return { ...course, isEnrolled };
      })
    );
  }, [enrolledCourses]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`http://localhost:5000/api/courses/${id}`);
        alert("Course Deleted Successfully!");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course.");
      }
    }
  };

  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    // Category/price filter
    if (filter === "all") return matchesSearch;
    if (filter === "free") return matchesSearch && course.price === 0;
    if (filter === "paid") return matchesSearch && course.price > 0;
    // Add more filters as needed (e.g. by category)

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Discover the perfect course to enhance your skills and knowledge</p>
      </div>

      <div className="course-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses or instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <FaFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Courses</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            className="create-course-btn"
            onClick={() => navigate("/create/courses")}
          >
            Create New Course
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && filteredCourses.length === 0 && (
        <div className="no-courses">
          <h3>No courses found</h3>
          <p>Try adjusting your search or filter</p>
        </div>
      )}

      <div className="course-grid">
        {filteredCourses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-image-container">
              <img
                src={
                  course?.image?.startsWith("http")
                    ? course.image
                    : `http://localhost:5000/${course.image}`
                }
                alt={course.title}
                className="course-image"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=Course+Image";
                }}
              />
              {course.price === 0 ? (
                <span className="course-badge free">Free</span>
              ) : (
                <span className="course-badge premium">Premium</span>
              )}
            </div>

            <div className="course-content">
              <h3>{course.title}</h3>
              <div className="course-instructor">
                <img
                  src="https://via.placeholder.com/30x30"
                  alt="instructor"
                  className="instructor-avatar"
                />
                <span>{course.instructor}</span>
              </div>

              <div className="course-details">
                <p className="course-duration">{course.duration} hours</p>
                <div className="course-rating">
                  <FaStar className="star-icon" />
                  <span>{(Math.random() * 2 + 3).toFixed(1)}</span>
                </div>
              </div>

              <div className="course-price">
                {course.price === 0 ? (
                  <span className="free-text">Free</span>
                ) : (
                  <span>${course.price.toFixed(2)}</span>
                )}
              </div>

              <div className="course-actions">
                <Link to={`/course/${course._id}`} className="view-course-btn">
                  View Details
                </Link>

                {(isTeacher || isAdmin) && (
                  <div className="teacher-actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/edit-course/${course._id}`)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(course._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                    {/* Link to add new lecture in course */}
                    <Link
                      to={`/course/${course._id}/lectures/add`}
                      className="btn-edit"
                    >
                      Add Lecture
                    </Link>
                  </div>
                )}
                {isStudent && (
                  <div className="student-actions">
                    {!course?.isEnrolled ? (
                      <Link
                        to={`/course/${course._id}/enroll`}
                        className="btn-enroll"
                      >
                        Enroll Now
                      </Link>
                    ) : (
                      <Link
                        to={`/course/${course._id}/learn`}
                        className="btn-enroll"
                      >
                        Continue Learning
                      </Link>
                    )}
                    {course?.isEnrolled && (
                      <Link
                        to={`/course/${course._id}/feedback`}
                        className="btn-feedback"
                      >
                        <FaComments /> Feedback
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
