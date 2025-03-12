import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./studentLogin.css"; 

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log("Logging in with:", email, password);
      
      const response = await axios.post("http://localhost:5000/api/student/student-login", { email, password });
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
    }
  };

  return (
    <div className="login-container">
      <h2>Student Login</h2>
      {message && <p className="error-message">{message}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn">Login as Student</button>
      </form>
    </div>
  );
};

export default StudentLogin;
