import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaStar,
  FaUserCircle,
  FaCalendarAlt,
  FaClock,
  FaChalkboardTeacher,
  FaRegBookmark,
  FaBookmark,
  FaArrowLeft,
} from "react-icons/fa";
import { useUserData } from "../../context/UserContext";
import "./courseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuth, userRole } = useUserData();
  const [course, setCourse] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch course details and feedback
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${id}`
        );
        setCourse(courseResponse.data);

        // Fetch course feedback/reviews
        const feedbackResponse = await axios.get(
          `http://localhost:5000/api/feedback/course/${id}`
        );
        setFeedback(feedbackResponse.data);

        // Check if user is enrolled (in a real app, this would be a separate API call)
        // This is a placeholder - replace with actual enrollment check logic
        const checkEnrollment = localStorage.getItem(`enrolled_${id}`);
        setEnrolled(!!checkEnrollment);

        // Check if course is saved (in a real app, this would be a separate API call)
        // This is a placeholder - replace with actual saved courses check
        const checkSaved = localStorage.getItem(`saved_${id}`);
        setSaved(!!checkSaved);

        setError(null);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const calculateAverageRating = () => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((total, item) => total + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  const handleEnroll = () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    navigate(`/course/${id}/enroll`);
  };

  // Handle save/bookmark course
  const handleSaveToggle = () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }

    // Toggle saved state
    if (saved) {
      localStorage.removeItem(`saved_${id}`);
      setSaved(false);
    } else {
      localStorage.setItem(`saved_${id}`, "true");
      setSaved(true);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="course-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  // Render error state
  if (error || !course) {
    return (
      <div className="course-details-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error || "Could not load course details."}</p>
        <Link to="/courses" className="back-to-courses">
          <FaArrowLeft /> Back to courses
        </Link>
      </div>
    );
  }

  // Render star rating component
  const renderStarRating = (rating, size = "small") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "star filled" : "star empty"}
          size={size === "large" ? 24 : 16}
        />
      );
    }
    return <div className={`star-rating ${size}`}>{stars}</div>;
  };

  return (
    <div className="course-details-page">
      <div className="course-details-nav">
        <Link to="/courses" className="back-to-courses">
          <FaArrowLeft /> Back to courses
        </Link>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={handleSaveToggle}
        >
          {saved ? <FaBookmark /> : <FaRegBookmark />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="course-header">
        <div className="course-header-content">
          <h1>{course.title}</h1>

          <div className="course-meta">
            <div className="rating-container">
              {renderStarRating(calculateAverageRating(), "large")}
              <span className="rating-value">{calculateAverageRating()}/5</span>
              <span className="review-count">({feedback.length} reviews)</span>
            </div>

            <div className="instructor-info">
              <FaChalkboardTeacher />
              <span>Instructor: {course.instructor}</span>
            </div>
          </div>

          <div className="course-tags">
            {course.price === 0 ? (
              <span className="tag free">Free</span>
            ) : (
              <span className="tag premium">Premium</span>
            )}
            <span className="tag">Self-paced</span>
            <span className="tag">Online</span>
          </div>
        </div>

        <div className="course-image-container">
          <img
            src={
              course?.image?.startsWith("http")
                ? course.image
                : `http://localhost:5000/${course.image}`
            }
            alt={course.title}
            className="course-banner-image"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/600x400?text=Course+Image";
            }}
          />
        </div>
      </div>

      <div className="course-content-grid">
        <div className="course-main-content">
          <section className="course-description">
            <h2>About This Course</h2>
            <p>
              {course.description ||
                "This comprehensive course is designed to provide you with in-depth knowledge and practical skills. Through a combination of lectures, hands-on exercises, and real-world projects, you'll gain valuable experience and be well-prepared for applying these concepts in professional settings."}
            </p>
          </section>

          <section className="course-curriculum">
            <h2>What You'll Learn</h2>
            <ul className="curriculum-list">
              <li>Understand core concepts and principles</li>
              <li>Apply knowledge through practical exercises</li>
              <li>Develop real-world projects to build your portfolio</li>
              <li>Master advanced techniques and methodologies</li>
              <li>Gain problem-solving skills relevant to the industry</li>
            </ul>
          </section>

          <section className="course-requirements">
            <h2>Requirements</h2>
            <ul>
              <li>Basic understanding of the subject</li>
              <li>A computer with internet access</li>
              <li>Enthusiasm to learn and practice</li>
            </ul>
          </section>

          <section className="course-reviews">
            <div className="reviews-header">
              <h2>Student Reviews</h2>
              {isAuth && userRole === "student" ? (
                <Link
                  to={`/course/${id}/feedback`}
                  className="add-review-button"
                >
                  Write a Review
                </Link>
              ) : null}
            </div>

            {feedback.length === 0 ? (
              <p className="no-reviews">
                No reviews yet. Be the first to review this course!
              </p>
            ) : (
              <div className="reviews-list">
                {feedback.map((review, index) => (
                  <div key={review._id || index} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <FaUserCircle className="reviewer-avatar" />
                        <div className="reviewer-details">
                          <h4>{review.user?.name || "Anonymous Student"}</h4>
                          <span className="review-date">
                            <FaCalendarAlt />
                            {new Date(
                              review.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {renderStarRating(review.rating)}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="course-sidebar">
          <div className="course-info-card">
            <div className="price-container">
              {course.price === 0 ? (
                <h3 className="course-price free">Free</h3>
              ) : (
                <h3 className="course-price">${course.price}</h3>
              )}
            </div>

            <ul className="course-features">
              <li>
                <FaClock />
                <span>
                  <strong>{course.duration} hours</strong> of content
                </span>
              </li>
              <li>
                <FaCalendarAlt />
                <span>
                  <strong>Lifetime</strong> access
                </span>
              </li>
              <li>
                <FaUserCircle />
                <span>
                  <strong>24/7</strong> support
                </span>
              </li>
            </ul>

            {userRole === "student" ? (
              <button className="enroll-button" onClick={handleEnroll}>
                {course.price === 0
                  ? "Enroll Now - Free"
                  : `Enroll Now - $${course.price}`}
              </button>
            ) : (
              <Link to={`/course/${id}/learn`} className="access-course-button">
                Access Course
              </Link>
            )}

            <div className="guarantee">
              <p>30-Day Money-Back Guarantee</p>
            </div>
          </div>

          <div className="instructor-card">
            <h3>About the Instructor</h3>
            <div className="instructor-profile">
              <FaUserCircle className="instructor-avatar" />
              <div>
                <h4>{course.instructor}</h4>
                <p className="instructor-title">Expert Educator</p>
              </div>
            </div>
            <p className="instructor-bio">
              A passionate educator with extensive experience in teaching and
              real-world application of concepts. Committed to helping students
              achieve their learning goals through engaging content and
              practical guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
