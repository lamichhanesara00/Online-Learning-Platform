import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Testimonial.css";

const Testimonial = () => {
  console.log("✅ Testimonial Component Loaded");

  const { courseId } = useParams();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if courseId is properly retrieved
  useEffect(() => {
    if (!courseId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/feedback/course/${courseId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch feedback.");
        }
        return response.json();
      })
      .then((data) => {
        setFeedback(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching feedback:", error);
        setError("Failed to load feedback.");
        setLoading(false);
      });
  }, [courseId]);

  return (
    <section className="testimonials">
      <h2>What Our Users Say</h2>

      {loading && <p>Loading testimonials...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="testimonials-container">
        {feedback.length > 0 ? (
          feedback.map((testimonial) => (
            <div key={testimonial._id} className="testimonial-card">
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt={testimonial.user?.name || "Anonymous"}
              />
              <h3>{testimonial.user?.name || "Anonymous"}</h3>
              <p className="position">Student</p>
              <p className="message">"{testimonial.comment}"</p>
              <p className="rating">Rating: {testimonial.rating}/5</p>
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
