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
            {featuredCourses.length > 0 ? (
              featuredCourses.map((lecture) => (
                <div key={lecture._id} className="lecture-progress">
                  <h4>{lecture.title}</h4>
                  <p>{lecture.description}</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${90 || 0}%` }}
                    ></div>
                  </div> 
                <p>{90 || 0}% Completed</p>
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
  )
};

export default Home;
