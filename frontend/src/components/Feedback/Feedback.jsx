import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./feedback.css"; // Import the updated CSS

const FeedbackForm = () => {
  const { courseId } = useParams();
  const [user, setUser] = useState(""); // Ensure user is stored as a string
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [feedbackId, setFeedbackId] = useState(null);

  // ✅ Fetch feedback for editing
  useEffect(() => {
    if (feedbackId) {
      fetch(`http://localhost:5000/api/feedback/${feedbackId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched user:", data.user); // Debugging
          setUser(typeof data.user === "object" ? data.user.name : data.user || ""); // ✅ Fix user type
          setComment(data.comment || "");
          setRating(data.rating || 5);
        })
        .catch((error) => {
          console.error("Error fetching feedback for edit", error);
          setError("Error fetching feedback.");
        });
    }
  }, [feedbackId]);

  // ✅ Handle Submit (Create or Edit Feedback)
  const handleSubmit = (e) => {
    e.preventDefault();
    const feedbackData = { user, comment, rating };

    const method = feedbackId ? "PUT" : "POST";
    const url = feedbackId
      ? `http://localhost:5000/api/feedback/${feedbackId}`
      : `http://localhost:5000/api/course/${courseId}/feedback`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message.includes("successfully")) {
          setSuccessMessage(data.message);
          setUser("");
          setComment("");
          setRating(5);
          setFeedbackId(null);
        } else {
          setError("Error submitting feedback.");
        }
      })
      .catch((error) => {
        setError("There was an error submitting your feedback.");
        console.error(error);
      });
  };

  return (
    <div className="feedback-form-container">
      <h3>{feedbackId ? "Edit Feedback" : "Give Your Feedback"}</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="user">Your Name:</label>
          <input
            type="text"
            id="user"
            value={user || ""} // ✅ Ensure it's always a string
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>

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
            onChange={(e) => setRating(e.target.value)}
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num}/5
              </option>
            ))}
          </select>
        </div>

        <button type="submit">
          {feedbackId ? "Update Feedback" : "Submit Feedback"}
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default FeedbackForm;
