import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaGraduationCap,
  FaClock,
  FaChalkboardTeacher,
  FaBook,
  FaPlayCircle,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa";
import { useUserData } from "../../context/UserContext";
import "./mycourses.css";

const MyCourses = () => {
  const { user } = useUserData();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        if (!user?._id) {
          navigate("/login");
          return;
        }

        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/progress/student/${user._id}`
        );
        setCourses(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setError("Failed to load your courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="my-courses-loading">
        <div className="loading-spinner"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-courses-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="my-courses-empty">
        <FaGraduationCap className="empty-icon" />
        <h2>You haven't enrolled in any courses yet</h2>
        <p>Explore our course catalog and start your learning journey today!</p>
        <Link to="/courses" className="browse-courses-btn">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <div className="my-courses-header">
        <h1>My Learning</h1>
        <p>
          Continue your learning journey. Track your progress and dive back into
          your courses.
        </p>
      </div>

      <div className="my-courses-list">
        {courses.map((item) => {
          const { course, progress } = item;

          return (
            <div key={course._id} className="course-card">
              <div className="course-card-image">
                <img
                  src={
                    course?.image?.startsWith("http")
                      ? course.image
                      : `http://localhost:5000/${course?.image}`
                  }
                  alt={course?.title}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/320x180?text=Course+Image";
                  }}
                />
                <div className="completion-badge">
                  {progress.progressPercentage}% Complete
                </div>
              </div>

              <div className="course-card-content">
                <h3>{course.title}</h3>

                <div className="course-meta-info">
                  <div className="meta-item">
                    <FaChalkboardTeacher />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="meta-item">
                    <FaClock />
                    <span>{course.duration} hours</span>
                  </div>
                  <div className="meta-item">
                    <FaBook />
                    <span>
                      {progress.completedCount} / {course.totalLectures}{" "}
                      lectures
                    </span>
                  </div>
                  {progress.timeSpent > 0 && (
                    <div className="meta-item">
                      <FaChartLine />
                      <span>
                        {Math.round(progress.timeSpent * 10) / 10} min spent
                      </span>
                    </div>
                  )}
                </div>

                <div className="course-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="course-actions">
                  {progress.lastAccessedLecture ? (
                    <Link
                      to={`/lecture/${progress.lastAccessedLecture._id}`}
                      className="continue-button"
                    >
                      <FaPlayCircle />
                      Continue Learning
                    </Link>
                  ) : (
                    <Link
                      to={`/course/${course._id}/learn`}
                      className="continue-button"
                    >
                      <FaGraduationCap />
                      Start Course
                    </Link>
                  )}

                  <Link
                    to={`/course/${course._id}/learn`}
                    className="view-all-button"
                  >
                    View All Lectures <FaArrowRight />
                  </Link>
                </div>
              </div>

              {progress.lastAccessedAt && (
                <div className="last-accessed">
                  Last viewed:{" "}
                  {new Date(progress.lastAccessedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCourses;
