import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./createCourse.css";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("instructor", instructor);
    formData.append("duration", duration);
    formData.append("price", price);
    formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Course Created Successfully!");
      navigate("/courses"); // Redirect to the courses page after successful submission
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Teacher Dashboard</h2>
        <ul>
          <li onClick={() => navigate("/create/courses")}>➕ Create Course</li>
          <li onClick={() => navigate("/manage-courses")}>📋 Manage Courses</li>
          <li onClick={() => navigate("/courses")}>📚 View Courses</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Create a New Course</h2>
        <form onSubmit={handleSubmit} className="create-course-form">
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Instructor Name"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Duration (hours)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price ($)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />

          <button type="submit">Create Course</button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
