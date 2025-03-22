import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaStar, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import axios from "axios";
import "./testimonial.css";

const Testimonial = ({ courseSpecific = false }) => {
  const { id: courseId } = useParams();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);

        // Determine which API endpoint to use based on whether we want course-specific testimonials
        const endpoint = "http://localhost:5000/api/feedback/random";

        const response = await axios.get(endpoint);

        // If we got valid data
        if (response.data && Array.isArray(response.data)) {
          // For homepage, limit to 3 testimonials
          const displayData = courseSpecific
            ? response.data
            : response.data.slice(0, 3);
          setTestimonials(displayData);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [courseId, courseSpecific]);

  // Helper to render star ratings
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "star filled" : "star empty"}
        />
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <section className="testimonials-section">
      <h2 className="section-title">
        {courseSpecific ? "Student Reviews" : "What Our Students Say"}
      </h2>

      {loading && (
        <div className="testimonials-loading">
          <div className="spinner"></div>
          <p>Loading testimonials...</p>
        </div>
      )}

      {error && (
        <div className="testimonials-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && testimonials.length === 0 && (
        <div className="no-testimonials">
          <p>
            No reviews available yet. Be the first to share your experience!
          </p>
        </div>
      )}

      {!loading && !error && testimonials.length > 0 && (
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial._id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {testimonial.user?.avatar ? (
                      <img
                        src={testimonial.user.avatar}
                        alt={testimonial.user.name}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            testimonial.user.name || "User"
                          )}&background=random&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="default-avatar">
                        {(testimonial.user?.name || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h3>{testimonial.user?.name || "Anonymous Student"}</h3>
                    <p className="date">
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {renderStarRating(testimonial.rating)}
              </div>

              <div className="testimonial-content">
                <FaQuoteLeft className="quote-icon left" />
                <p>{testimonial.comment}</p>
                <FaQuoteRight className="quote-icon right" />
              </div>

              {courseSpecific && testimonial.course && (
                <div className="testimonial-course">
                  <p>
                    Course: <strong>{testimonial.course.title}</strong>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonial;
