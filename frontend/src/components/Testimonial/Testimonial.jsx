import React, { useState, useEffect } from "react";
import "./Testimonial.css"; // Import CSS

const Testimonial = () => {
  console.log("✅ Testimonial Component Loaded");

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feedback data from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/course/67b9bbb6c025d2bbf38e7674/feedback")
      .then((response) => response.json())
      .then((data) => {
        setFeedback(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching feedback:", error);
        setError("Failed to load feedback.");
        setLoading(false);
      });
  }, []); // Empty dependency array means this effect runs once on component mount

  // Handle Delete Feedback
  const handleDelete = (feedbackId) => {
    fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Feedback deleted successfully") {
          setFeedback(feedback.filter((item) => item._id !== feedbackId));
        }
      })
      .catch((error) => {
        console.error("❌ Error deleting feedback:", error);
        setError("Failed to delete feedback.");
      });
  };

  // Handle Edit Feedback
  const handleEdit = (feedbackId) => {
    const newComment = prompt("Enter new comment: ");
    const newRating = prompt("Enter new rating: (1-5)");

    if (!newComment || !newRating) return;

    const updatedFeedback = { comment: newComment, rating: newRating };

    fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFeedback),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Feedback updated successfully") {
          setFeedback(
            feedback.map((item) =>
              item._id === feedbackId
                ? { ...item, comment: newComment, rating: newRating }
                : item
            )
          );
        }
      })
      .catch((error) => {
        console.error("❌ Error editing feedback:", error);
        setError("Failed to edit feedback.");
      });
  };

  return (
    <section className="testimonials">
      <h2>What Our Users Say</h2>

      {/* If loading or error occurred */}
      {loading && <p>Loading testimonials...</p>}
      {error && <p>{error}</p>}

      <div className="testimonials-container">
        {/* Loop through dynamic feedback data */}
        {feedback.length > 0 ? (
          feedback.map((testimonial) => (
            <div key={testimonial._id} className="testimonial-card">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg" // Placeholder image
                alt={testimonial.user}
                className="testimonial-img"
              />
              <h3>{testimonial.user}</h3>
              <p className="position">Student</p> {/* Assuming all feedback is from students */}
              <p className="message">"{testimonial.comment}"</p>
              <p className="rating">Rating: {testimonial.rating}/5</p>

              {/* Add Edit and Delete buttons */}
              <button onClick={() => handleEdit(testimonial._id)} className="edit-btn">
                Edit
              </button>
              <button
                onClick={() => handleDelete(testimonial._id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No feedback available yet.</p>
        )}
      </div>
    </section>
  );
};

export default Testimonial;
