import React from "react";
import { Link } from "react-router-dom";
import "./home.css";
import Testimonial from "../../components/Testimonial/Testimonial"; // ✅ Correct Import

const Home = () => {
  console.log("✅ Home Component Loaded"); // Debugging log

  return (
    <div className="home-container">
      <h1>Welcome to Our Learning Platform</h1>
      <p>Explore, Learn, and Grow with Us</p>
      
      <Link to="/register">
        <button className="get-started-btn">Get Started</button>
      </Link>

      

      {/* Displaying the Testimonial component */}
      <Testimonial />
    </div>
  );
};

export default Home;
