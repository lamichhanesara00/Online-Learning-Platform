import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaBook, FaPlus, FaEdit, FaTrash, FaBars } from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch Lectures
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-lectures");
        setLectures(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch lectures");
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // Delete Lecture
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`http://localhost:5000/api/admin/delete-lecture/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Lecture deleted successfully!");
      setLectures(lectures.filter((lecture) => lecture._id !== id));
    } catch (error) {
      alert("Failed to delete lecture");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <img src="/profile.jpg" alt="Admin" className="admin-avatar" />
          <h3>Admin Panel</h3>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
        </div>

        <nav>
          <ul>
            <li><FaUser /> <Link to="/admin/profile">Profile</Link></li>
            <li><FaBook /> <Link to="/admin/dashboard">Dashboard</Link></li>
            <li><FaPlus /> <Link to="/admin/add-lecture">Add Lecture</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h2 className="dashboard-title">Admin Dashboard</h2>

        {/* Dashboard Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <FaBook className="stat-icon" />
            <h3>{lectures.length}</h3>
            <p>Total Lectures</p>
          </div>
          <div className="stat-card">
            <FaUser className="stat-icon" />
            <h3>10+</h3>
            <p>Registered Users</p>
          </div>
        </div>

        {/* Add Lecture Button */}
        <Link to="/admin/add-lecture">
          <button className="add-lecture-btn">
            <FaPlus className="icon" /> Add New Lecture
          </button>
        </Link>

        {/* Lecture List */}
        <h3 className="lecture-list-title">Lecture List</h3>

        {loading ? (
          <p>Loading lectures...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : lectures.length > 0 ? (
          <div className="lecture-list">
            {lectures.map((lecture) => (
              <div key={lecture._id} className="lecture-card">
                <div className="lecture-info">
                  <h4>{lecture.title}</h4>
                  <p>{lecture.description}</p>
                </div>
                <div className="lecture-actions">
                  <button className="edit-btn">
                    <FaEdit className="icon" /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(lecture._id)}>
                    <FaTrash className="icon" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No lectures available.</p>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
