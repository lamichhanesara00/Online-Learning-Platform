import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./home.css";
import Testimonial from "../../components/Testimonial/Testimonial";
import { useUserData } from "../../context/UserContext";
import {
  FaStar,
  FaClock,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";

const Home = () => {
  const { isAuth, user } = useUserData();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all courses for non-authenticated users
        const coursesResponse = await axios.get(
          "http://localhost:5000/api/courses"
        );
        setCourses(coursesResponse.data);

        if (isAuth && user?._id) {
          try {
            const enrolledResponse = await axios.get(
              `http://localhost:5000/api/enrollments/user/${user._id}/progress`
            );
            setEnrolledCourses(enrolledResponse.data);
          } catch (err) {
            console.error("Error fetching enrolled courses:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load courses");
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuth, user]);

  const featuredCourses = courses.slice(0, 4);

  // Render loading state
  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Transform Your Future with Online Learning</h1>
          <p>
            Access high-quality courses taught by industry experts and advance
            your career
          </p>

          {!isAuth ? (
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started
              </Link>
              <Link to="/courses" className="secondary-button">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/my-courses" className="primary-button">
                My Learning
              </Link>
              <Link to="/courses" className="secondary-button">
                Explore More Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main content section - shows different views for logged in vs non-logged in users */}
      {isAuth && user ? (
        // Content for authenticated users
        <div className="user-dashboard-section">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <Link to="/my-courses" className="see-all-link">
              See all my courses <FaArrowRight />
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="no-courses-message">
              <FaGraduationCap className="icon" />
              <h3>You haven't enrolled in any courses yet</h3>
              <p>Explore our catalog and start your learning journey today!</p>
              <Link to="/courses" className="primary-button">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="enrolled-courses-grid">
              {enrolledCourses.slice(0, 3).map((item) => {
                const { enrollment, progress } = item;
                const course = enrollment.course;

                return (
                  <div key={course._id} className="enrolled-course-card">
                    <div className="course-image">
                      <img
                        src={
                          course.image?.startsWith("http")
                            ? course.image
                            : `http://localhost:5000/${course.image}`
                        }
                        alt={course.title}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/320x180?text=Course+Image";
                        }}
                      />
                      <div className="progress-indicator">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progress.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span>{progress.progressPercentage}% complete</span>
                      </div>
                    </div>

                    <div className="course-content">
                      <h3>{course.title}</h3>
                      <div className="course-meta">
                        <span>
                          <FaChalkboardTeacher /> {course.instructor}
                        </span>
                        <span>
                          <FaClock /> {course.duration} hours
                        </span>
                      </div>
                      <Link
                        to={`/course/${course._id}/learn`}
                        className="continue-button"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="featured-courses-section">
          <div className="section-header">
            <h2>Featured Courses</h2>
            <Link to="/courses" className="see-all-link">
              See all courses <FaArrowRight />
            </Link>
          </div>

          <div className="courses-grid">
            {featuredCourses.length === 0 ? (
              <p className="no-content-message">
                No courses available at the moment.
              </p>
            ) : (
              featuredCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-image">
                    <img
                      src={
                        course.image?.startsWith("http")
                          ? course.image
                          : `http://localhost:5000/${course.image}`
                      }
                      alt={course.title}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/320x180?text=Course+Image";
                      }}
                    />

                    {course.price === 0 ? (
                      <div className="course-tag free">Free</div>
                    ) : (
                      <div className="course-tag premium">${course.price}</div>
                    )}
                  </div>

                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <div className="course-meta">
                      <span>
                        <FaChalkboardTeacher /> {course.instructor}
                      </span>
                      <span>
                        <FaClock /> {course.duration} hours
                      </span>
                      <span>
                        <FaStar className="star" /> 4.5
                      </span>
                    </div>

                    <div className="lectures-info">
                      {course.lectures?.length || 0} lectures •{" "}
                      {course.lectures?.reduce(
                        (total, lecture) => total + (lecture.duration || 0),
                        0
                      )}{" "}
                      minutes
                    </div>

                    <Link
                      to={`/course/${course._id}`}
                      className="view-course-button"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="see-more-container">
            <Link to="/courses" className="see-more-button">
              Browse All Courses <FaArrowRight />
            </Link>
          </div>
        </div>
      )}

      <Testimonial />

      <div className="cta-section">
        <h2>Ready to Start Learning?</h2>
        <p>
          Join thousands of students who are already learning on our platform
        </p>
        {!isAuth ? (
          <Link to="/register" className="cta-button">
            Sign Up Now
          </Link>
        ) : (
          <Link to="/courses" className="cta-button">
            Explore Courses
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
