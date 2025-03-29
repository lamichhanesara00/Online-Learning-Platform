import React from 'react';
import './about.css'; // ✅ Import CSS for styling

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Our Platform</h1>
        <p>
          We are dedicated to providing high-quality online education to help students
          and professionals grow. Our platform offers interactive lessons, expert instructors, 
          and a supportive community that ensures an engaging learning experience.
        </p>

        <div className="about-content">
          <div className="about-box">
            <h2>Our Mission</h2>
            <p>
              To make education accessible and engaging for everyone through technology-driven learning.
            </p>
          </div>

          <div className="about-box">
            <h2> What We Offer</h2>
            <ul>
              <li>Expert-led online courses</li>
              <li>Interactive quizzes and exercises</li>
              <li>Certification upon completion</li>
              <li>24/7 Learning access</li>
            </ul>
          </div>

          <div className="about-box">
            <h2>Join Our Community</h2>
            <p>
              Become part of a growing network of learners and professionals who are mastering new skills
              every day!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
