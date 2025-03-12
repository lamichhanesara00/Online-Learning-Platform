import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";


const AdminLogin = () => {
  const [adminData, setAdminData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", adminData);

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminRole", "admin"); // ✅ Save role
        alert("Login successful!");
        navigate("/admin/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" name="email" value={adminData.email} onChange={handleChange} required />

        <label>Password:</label>
        <input type="password" name="password" value={adminData.password} onChange={handleChange} required />

        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
};

export default AdminLogin;
