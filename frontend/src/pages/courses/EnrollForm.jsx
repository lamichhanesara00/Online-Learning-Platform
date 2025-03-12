// src/pages/courses/EnrollForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./enrollForm.css";

const EnrollForm = ({ course, onClose }) => {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleEnrollment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/enroll", {
        studentName,
        email,
        courseId: course._id,
      });

      setMessage(res.data.message);
      setTimeout(() => {
        onClose();
        navigate(`/course/${course._id}/lectures`); // Redirect to the course lectures page after successful enrollment
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage("Enrollment failed!");
    }
  };

  return (
    <div className="enrollment-form-container">
      <div className="enrollment-form">
        <h2>Enroll in {course.title}</h2>
        {message ? (
          <p className="success-message">{message}</p>
        ) : (
          <form onSubmit={handleEnrollment}>
            <input
              type="text"
              placeholder="Enter your name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Submit Enrollment</button>
            <button className="close-btn" onClick={onClose}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EnrollForm;
