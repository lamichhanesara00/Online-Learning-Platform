import React, { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css"; // Reuse admin styles

const AdminRegister = () => {
  const { registerUser, btnLoading, error } = useUserData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    registerUser(name, email, password, "admin", navigate); // ✅ Pass "admin" role
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Register</h2>
      <p className="register-subtitle">Create an admin account</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          placeholder="Create a strong password"
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={btnLoading}>
          {btnLoading ? "Registering..." : "Register"}
        </button>

        <p className="login-link">
          Already have an admin account? <Link to="/admin-login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminRegister;
