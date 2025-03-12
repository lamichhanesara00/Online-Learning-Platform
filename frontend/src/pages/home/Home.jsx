import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./home.css";
import Testimonial from "../../components/Testimonial/Testimonial"; // ✅ Import Testimonials

const Home = () => {
  const [lectures, setLectures] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Lectures & Progress Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lectures
        const lectureRes = await axios.get("http://localhost:5000/api/admin/get-lectures");
        setLectures(lectureRes.data);

        // Fetch student progress (Replace with actual user ID)
        const userId = localStorage.getItem("userId"); // Example user ID storage
        if (userId) {
          const progressRes = await axios.get(`http://localhost:5000/api/progress/track/${userId}`);
          setProgress(progressRes.data);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load lectures or progress");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
      <h1>Welcome to Our Learning Platform</h1>
      <p>Explore, Learn, and Grow with Us</p>
      
      <Link to="/register">
        <button className="get-started-btn">Get Started</button>
      </Link>

      {/* Student Progress Section */}
      <div className="progress-section">
        <h2>📚 Your Learning Progress</h2>
        {loading ? (
          <p>Loading progress...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="progress-container">
            {lectures.length > 0 ? (
              lectures.map((lecture) => (
                <div key={lecture._id} className="lecture-progress">
                  <h4>{lecture.title}</h4>
                  <p>{lecture.description}</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress[lecture._id] || 0}%` }}
                    ></div>
                  </div>
                  <p>{progress[lecture._id] || 0}% Completed</p>
                </div>
              ))
            ) : (
              <p>No lectures available yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Displaying the Testimonial component */}
      <Testimonial />
    </div>
  );
};

export default Home;
