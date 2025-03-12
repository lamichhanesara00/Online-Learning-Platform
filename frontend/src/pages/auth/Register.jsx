import React, { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "./Register.css"; // Import updated CSS

const Register = () => {
  const { registerUser, btnLoading, error } = useUserData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default to student
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    registerUser(name, email, password, role); // Pass role to the register function
  };

  return (
    <div className="register-container">
      <h2>Sign Up</h2>
      <p className="register-subtitle">Create an account to start learning today!</p>

      {/* Show Error Message */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label><FaUser className="icon" /> Name</label>
          <input type="text" name="name" placeholder="Enter your name" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label><FaEnvelope className="icon" /> Email</label>
          <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label><FaLock className="icon" /> Password</label>
          <input type="password" name="password" placeholder="Create a strong password" onChange={handleChange} required />
        </div>

     
     
        {/* Role selection */}
        <div className="role-selection">
          <label>Select your role:</label>
          <label>
            <input 
              type="radio" 
              name="role" 
              value="student" 
              checked={formData.role === "student"} 
              onChange={handleChange} 
            />
            Student
          </label>
          <label>
            <input 
              type="radio" 
              name="role" 
              value="teacher" 
              checked={formData.role === "teacher"} 
              onChange={handleChange} 
            />
            Teacher
          </label>
        </div>

        <button type="submit" disabled={btnLoading}>
          {btnLoading ? "Registering..." : "Register"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
  