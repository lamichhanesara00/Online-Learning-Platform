import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
    const [enrollments, setEnrollments] = useState([]);
    const navigate = useNavigate();

    // Get logged-in user details from localStorage
    const studentEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    useEffect(() => {
        if (!studentEmail || userRole !== "student") {
            navigate("/login"); // Redirect if not a student
            return;
        }

        // Fetch enrolled courses for the student
        axios.get(`http://localhost:5000/api/student/dashboard/${studentEmail}`)
            .then((response) => {
                setEnrollments(response.data.enrollments);
            })
            .catch((error) => {
                console.error("Error fetching dashboard data:", error);
            });
    }, [studentEmail, navigate, userRole]);

    return (
        <div className="dashboard-container">
            <h2>📚 Student Dashboard</h2>
            <div className="course-list">
                {enrollments.length === 0 ? (
                    <p>No enrolled courses found.</p>
                ) : (
                    enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="course-card">
                            <h3>{enrollment.courseId.title}</h3>
                            <p><strong>Instructor:</strong> {enrollment.courseId.instructor}</p>
                            <p><strong>Enrolled on:</strong> {new Date(enrollment.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
