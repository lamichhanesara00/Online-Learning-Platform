import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Logging in with:", email, password);

      const response = await axios.post(
        "http://localhost:5000/api/student/student-login",
        { email, password }
      );
      const { token, user } = response.data;

      // ✅ Store token and student details in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);

      if (user.role === "student") {
        navigate("/dashboard");
      } else {
        setMessage("Access Denied: Only students can log in.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-heading">Student Login</h2>

        {message && <div className="auth-error">{message}</div>}

        <form onSubmit={handleLogin}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login as Student"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
