import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import "./feedback.css";

const FeedbackForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");

  // Fetch course name to display in the header
  useEffect(() => {
    const fetchCourseName = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/courses/${courseId}`
        );
        const data = await response.json();
        if (response.ok) {
          setCourseName(data.title);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    if (courseId) {
      fetchCourseName();
    }
  }, [courseId]);

  // Handle Submit (Create Feedback)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!courseId || !comment || !rating) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const feedbackData = {
      course: courseId,
      comment,
      rating,
    };

    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Feedback submitted successfully!");
        setComment("");
        setRating(5);
      } else {
        setError(data.message || "Error submitting feedback.");
      }
    } catch (error) {
      setError("There was an error submitting your feedback.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Render star rating component
  const renderStarRating = () => {
    return (
      <div className="star-rating">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="star-option">
            <input
              type="radio"
              id={`star-${star}`}
              name="rating"
              value={star}
              checked={rating === star}
              onChange={() => setRating(star)}
            />
            <label htmlFor={`star-${star}`}>
              <FaStar
                className={star <= rating ? "star-filled" : "star-empty"}
              />
              <span>{star}</span>
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <div className="feedback-header">
          <button onClick={() => navigate(-1)} className="back-link">
            <FaArrowLeft /> Back to Course
          </button>
          <h2>Leave Your Feedback</h2>
          {courseName && (
            <p className="course-title">for "{courseName}&quot;</p>
          )}
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="rating">Your Rating</label>
            {renderStarRating()}
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Comment</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this course..."
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
