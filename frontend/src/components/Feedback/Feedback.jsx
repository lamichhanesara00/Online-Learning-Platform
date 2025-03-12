import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./feedback.css"; // Import CSS

const FeedbackForm = () => {
  const { courseId } = useParams(); // Get courseId from URL
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ Handle Submit (Create Feedback)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId || !comment || !rating) {
      setError("All fields are required.");
      return;
    }

    const feedbackData = { 
      course: courseId, // ✅ Sending courseId as "course"
      comment, 
      rating 
    };

    try {
      const response = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}` // Ensure user is authenticated
        },
        body: JSON.stringify(feedbackData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setComment("");
        setRating(5);
      } else {
        setError(data.message || "Error submitting feedback.");
      }
    } catch (error) {
      setError("There was an error submitting your feedback.");
      console.error(error);
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Give Your Feedback</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="comment">Your Comment:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-field">
          <label htmlFor="rating">Your Rating:</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num}/5
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Submit Feedback</button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FeedbackForm;
