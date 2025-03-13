import React, { useState, useEffect } from "react";
import { useCourseData } from "../../context/CourseContext";
import { Link, useNavigate } from "react-router-dom";
import "./courses.css";

const Courses = () => {
  const { courses, loading, error } = useCourseData();
  const [userRole, setUserRole] = useState(null); // Store user role
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole"); // Get role from localStorage
    console.log("User Role from localStorage:", role); // Debugging
    setUserRole(role);
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>

      {/* ✅ Show "Create Course" and "Manage Courses" only if user is a teacher */}
      {userRole === "teacher" && (
        <div className="teacher-actions">
          <button className="btn-create" onClick={() => navigate("/create/courses")}>
             Create Course
          </button>
          <button className="btn-manage" onClick={() => navigate("/manage-courses")}>
            Manage Courses
          </button>
        </div>
      )}

      <div className="course-list">
        {courses.slice(0, 3).map((course) => (
          <div key={course._id} className="course-card">
            <img src={`http://localhost:5000/${course.image}`} alt={course.title} className="course-image" />
            <div className="course-content">
              <h3>{course.title}</h3>
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Duration:</strong> {course.duration} hours</p>
              <p><strong>Price:</strong> ${course.price}</p>

              {/* "Get Started" Now Navigates to Create Course Page */}
              <button className="btn-primary" onClick={() => navigate("/create/courses")}>
                 Create Course
              </button>

              <Link to={`/course/${course._id}/feedback`}>
                <button className="btn-secondary">View Feedback</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
