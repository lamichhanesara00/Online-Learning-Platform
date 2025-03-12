import React, { useState } from "react";
import { useCourseData } from "../../context/CourseContext";
import { Link } from "react-router-dom";
import EnrollForm from "./EnrollForm"; // Ensure this path is correct
import "./courses.css";

const Courses = () => {
  const { courses, loading, error } = useCourseData();
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      <div className="course-list">
        {courses.slice(0, 3).map((course) => (
          <div key={course._id} className="course-card">
            <img src={`http://localhost:5000/${course.image}`} alt={course.title} className="course-image" />
            <div className="course-content">
              <h3>{course.title}</h3>
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Duration:</strong> {course.duration} hours</p>
              <p><strong>Price:</strong> ${course.price}</p>

              <button className="btn-primary" onClick={() => setSelectedCourse(course)}>
                Get Started
              </button>

              <Link to={`/course/${course._id}/feedback`}>
                <button className="btn-secondary">View Feedback</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && <EnrollForm course={selectedCourse} onClose={() => setSelectedCourse(null)} />}
    </div>
  );
};

export default Courses;
