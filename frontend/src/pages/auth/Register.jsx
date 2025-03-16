import React, { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { Link } from "react-router-dom";

const Register = () => {
  const { registerUser, btnLoading, error } = useUserData();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // Default to student
  });

  const handleChange = (e) => {
    console.log(e.target.name, e.target.value);
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
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-heading">Sign Up</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Name</label>
          <input
            className="auth-input"
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
            required
          />

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Create a strong password"
            onChange={handleChange}
            required
          />

          <div className="auth-role-selection">
            <label className="auth-role-label">Select your role:</label>
            <div className="auth-role-options">
              <label className="auth-role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === "student"}
                  onChange={handleChange}
                />
                <span>Student</span>
              </label>
              <label className="auth-role-option">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === "teacher"}
                  onChange={handleChange}
                />
                <span>Teacher</span>
              </label>
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={btnLoading}>
            {btnLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
