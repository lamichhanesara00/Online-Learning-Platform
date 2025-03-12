import React, { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const { loginUser, btnLoading, error, successMessage } = useUserData(); // ✅ Get successMessage from context
  const navigate = useNavigate();
  
  // State to handle input values and role selection
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role set to 'student'

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for required fields
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
    
    // Pass the email, password, and role to the login function
    loginUser(email, password, role, navigate);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* ✅ Show Success Message Popup */}
      {successMessage && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={btnLoading}
        />

        <label>Password:</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={btnLoading}
        />

        {/* Role selection */}
        <div className="role-selection">
          <label>Select your role:</label>
          <label>
            <input 
              type="radio" 
              name="role" 
              value="student" 
              checked={role === "student"} 
              onChange={() => setRole("student")} 
            />
            Student
          </label>
          <label>
            <input 
              type="radio" 
              name="role" 
              value="teacher" 
              checked={role === "teacher"} 
              onChange={() => setRole("teacher")} 
            />
            Teacher
          </label>
        </div>

        <button type="submit" disabled={btnLoading}>
          {btnLoading ? "Logging in..." : "Login"}
        </button>

        {/* ✅ Show Error Message */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
