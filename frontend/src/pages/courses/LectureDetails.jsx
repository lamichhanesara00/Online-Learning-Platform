import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaChalkboardTeacher,
  FaClock,
  FaBook,
  FaPlay,
} from "react-icons/fa";
import "./lectureDetails.css";

const LectureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch lecture data
    const fetchLectureDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/lectures/${id}`
        );
        setLecture(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching lecture details:", err);
        setError("Failed to load lecture details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLectureDetails();
    }
  }, [id]);

  // Navigate back to course page
  const handleBackToCourse = () => {
    if (lecture?.course?._id) {
      navigate(`/course/${lecture.course._id}`);
    } else {
      navigate("/courses");
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="lecture-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading lecture content...</p>
      </div>
    );
  }

  // Render error state
  if (error || !lecture) {
    return (
      <div className="lecture-details-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error || "Could not load lecture details."}</p>
        <button onClick={() => navigate("/courses")} className="back-button">
          <FaArrowLeft /> Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="lecture-details-page">
      <div className="lecture-details-nav">
        <button onClick={handleBackToCourse} className="back-to-course">
          <FaArrowLeft /> Back to course
        </button>
        {lecture.course && (
          <div className="course-info-pill">
            <span>From: </span>
            <strong>{lecture.course.title}</strong>
          </div>
        )}
      </div>

      <div className="lecture-header">
        <h1>{lecture.title}</h1>

        <div className="lecture-meta">
          <div className="lecture-meta-item">
            <FaClock />
            <span>{lecture.duration} minutes</span>
          </div>

          {lecture.course?.instructor && (
            <div className="lecture-meta-item">
              <FaChalkboardTeacher />
              <span>Instructor: {lecture.course.instructor}</span>
            </div>
          )}

          <div className="lecture-meta-item lecture-type">
            {lecture.type === "video" ? <FaPlay /> : <FaBook />}
            <span>
              {lecture.type === "video" ? "Video lecture" : "Reading material"}
            </span>
          </div>
        </div>
      </div>

      <div className="lecture-content-container">
        <div className="lecture-description">
          <h2>Description</h2>
          <p>{lecture.description}</p>
        </div>

        <div className="lecture-content">
          {lecture.type === "video" ? (
            <div className="video-container">
              {lecture.videoUrl ? (
                <div className="responsive-video">
                  <iframe
                    // src={lecture.videoUrl}
                    src={`https://www.youtube.com/embed/${lecture.videoUrl}?autoplay=0`}
                    allow="autoplay; encrypted-media"
                    allowfullscreen
                    title={lecture.title}
                    width="560"
                    height="315"
                  />
                  {/* <iframe
                    src={"https://www.youtube.com/watch?v=Opgx5ouOCzc"}
                    allowFullScreen
                    allow="accelerometer; 
                      autoplay; 
                      clipboard-write; 
                      encrypted-media; 
                      gyroscope; 
                      picture-in-picture; 
                      web-share"
                  ></iframe> */}
                </div>
              ) : (
                <div className="video-placeholder">
                  <FaPlay className="play-icon" />
                  <p>Video URL not available</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-content">
              {lecture.content ? (
                <div className="lecture-text-content">{lecture.content}</div>
              ) : (
                <div className="content-placeholder">
                  <FaBook className="book-icon" />
                  <p>Content not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lecture.course && (
        <div className="lecture-navigation">
          <div className="navigation-buttons">
            <button onClick={handleBackToCourse} className="nav-button course">
              Course Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureDetails;
