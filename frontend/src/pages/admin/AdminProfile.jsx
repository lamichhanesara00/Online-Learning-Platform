import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminProfile.css"; // ✅ Ensure this file exists

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  // ✅ Fetch Admin details when page loads
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin-login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(response.data);
      } catch (error) {
        console.error("Failed to fetch admin details", error);
      }
    };
    fetchAdmin();
  }, [navigate]);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    navigate("/admin-login");
  };

  return (
    <div className="admin-profile-container">
      <h2>Admin Profile</h2>
      {admin ? (
        <div className="profile-card">
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default AdminProfile;
