import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./dashboard.css";

const DashboardUser = () => {
    const [role, setRole] = useState("");
    const [courses, setCourses] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate();

    // Get user details
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        if (!userEmail) {
            navigate("/login");
            return;
        }

        setRole(userRole);

        if (userRole === "teacher") {
            axios.get("http://localhost:5000/api/courses/my-courses", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((response) => {
                    setCourses(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching courses:", error);
                });
        }
    }, [userEmail, userRole, navigate]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/courses/create",
                { title, description, price, category },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Course created successfully");
            setCourses([...courses, response.data.course]);
            setTitle("");
            setDescription("");
            setPrice("");
            setCategory("");
        } catch (error) {
            alert(error.response?.data?.message || "Error creating course");
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setCourses(courses.filter(course => course._id !== courseId));
            } catch (error) {
                console.error("Error deleting course:", error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
        window.location.reload();
    };

    return (
        <div className="dashboard-container">
            <h2>📚 Teacher Dashboard</h2>

            <div className="nav-actions">
                <button onClick={() => navigate("/")} className="back-btn">🏠 Back to Home</button>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
            </div>

            {role === "teacher" ? (
                <div>
                    <h3>Create a New Course</h3>
                    <form onSubmit={handleCreateCourse} className="create-course-form">
                        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                        <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                        <button type="submit">Create Course</button>
                    </form>
                </div>
            ) : (
                <p>You do not have access to this page.</p>
            )}
        </div>
    );
};

export default DashboardUser;
