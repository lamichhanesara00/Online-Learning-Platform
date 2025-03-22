import React, { useState, useEffect } from "react";
import axios from "axios";
import "./addLecture.css";

const AddLecture = () => {
  const [lectureData, setLectureData] = useState({
    title: "",
    description: "",
  });

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/lectures");
        setLectures(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch lectures");
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  const handleChange = (e) => {
    setLectureData({ ...lectureData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Admin not authenticated!");
        return;
      }

      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/admin/update-lecture/${editId}`,
          lectureData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Lecture updated successfully!");
        setEditMode(false);
        setEditId(null);
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/admin/add-lecture",
          lectureData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLectures([...lectures, response.data]);
        alert("Lecture added successfully!");
      }

      setLectureData({ title: "", description: "" });
    } catch (error) {
      alert("Failed to add/update lecture");
      console.error(error);
    }
  };

  const handleEdit = (lecture) => {
    setLectureData({ title: lecture.title, description: lecture.description });
    setEditMode(true);
    setEditId(lecture._id);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/admin/delete-lecture/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLectures(lectures.filter((lecture) => lecture._id !== id));
      alert("Lecture deleted successfully!");
    } catch (error) {
      alert("Failed to delete lecture");
      console.error(error);
    }
  };

  return (
    <div className="add-lecture-container">
      <h2>{editMode ? "Edit Lecture" : "Add New Lecture"}</h2>
      <p className="instruction-text">
        Please enter the lecture title and description below.
      </p>

      <form onSubmit={handleSubmit}>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={lectureData.title}
          onChange={handleChange}
          required
          placeholder="Enter lecture title"
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={lectureData.description}
          onChange={handleChange}
          required
          placeholder="Provide a brief summary of the lecture"
        ></textarea>

        <button type="submit">
          {editMode ? "Update Lecture" : "Add Lecture"}
        </button>
      </form>

      <h3>Lecture List</h3>
      {loading ? (
        <p>Loading lectures...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : lectures.length > 0 ? (
        <ul className="lecture-list">
          {lectures.map((lecture) => (
            <li key={lecture._id} className="lecture-item">
              <h4>{lecture.title}</h4>
              <p>{lecture.description}</p>
              <div className="lecture-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(lecture)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(lecture._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lectures available yet.</p>
      )}
    </div>
  );
};

export default AddLecture;
