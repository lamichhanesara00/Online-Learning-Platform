import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCircle,
  FaPlay,
  FaBook,
  FaClock,
  FaChartLine,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";
import { useUserData } from "../../context/UserContext";
import "./continueLearning.css";

const ContinueLearning = () => {
  const { id: courseId } = useParams();
  const { user } = useUserData();
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingTime, setTrackingTime] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [lecturesList, setLecturesList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Timer refs
  const timeSpentRef = useRef(0);
  const timerRef = useRef(null);
  const selectedLectureRef = useRef(null);

  // Fetch course details and user progress
  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        setLoading(true);

        if (!user?._id) {
          setError("You must be logged in to view this course");
          setLoading(false);
          return;
        }

        // Fetch course and progress data in one call
        const progressResponse = await axios.get(
          `http://localhost:5000/api/progress/${user._id}/${courseId}`
        );

        const {
          progress,
          course: fetchedCourse,
          stats,
        } = progressResponse.data;

        setCourse(fetchedCourse);
        setLecturesList(fetchedCourse.lectures || []);

        setProgressData({
          ...progress,
          completedLectures: progress.completedLectures.map(
            (lecture) => lecture._id
          ),
          stats,
        });

        // Set selected lecture (either last accessed or next to watch)
        if (progress.lastAccessedLecture) {
          // Fetch full lecture data if we only have the ID
          const lectureResponse = await axios.get(
            `http://localhost:5000/api/lectures/${progress.lastAccessedLecture._id}`
          );
          setSelectedLecture(lectureResponse.data);
        } else if (stats.nextLectureToWatch) {
          setSelectedLecture(stats.nextLectureToWatch);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching course and progress:", err);
        setError("Failed to load the course. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId && user?._id) {
      fetchCourseAndProgress();
    }

    // Cleanup function to save time spent on unmount
    return () => {
      if (trackingTime && timeSpentRef.current > 0) {
        saveTimeSpent();
      }
      clearInterval(timerRef.current);
    };
  }, [courseId, user]);

  // Update last accessed lecture
  const updateLastAccessedLecture = async (lectureId) => {
    if (!user?._id) return;

    try {
      await axios.post(`http://localhost:5000/api/progress/update`, {
        studentId: user._id,
        courseId: courseId,
        lectureId: lectureId,
      });
    } catch (error) {
      console.error("Error updating last accessed lecture:", error);
    }
  };

  // Save time spent on current lecture
  const saveTimeSpent = async () => {
    if (!user?._id || !selectedLecture || timeSpentRef.current === 0) return;

    try {
      const timeInMinutes = Math.round((timeSpentRef.current / 60) * 10) / 10; // Convert to minutes with 1 decimal

      await axios.post(`http://localhost:5000/api/progress/track-time`, {
        studentId: user._id,
        courseId: courseId,
        lectureId: selectedLecture._id,
        timeSpent: timeInMinutes,
      });

      // Reset counter after saving
      timeSpentRef.current = 0;
    } catch (error) {
      console.error("Error saving time spent:", error);
    }
  };

  // Mark lecture as completed
  const markLectureCompleted = async (lectureId) => {
    if (!user?._id) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/progress/update`,
        {
          studentId: user._id,
          courseId: courseId,
          lectureId: lectureId,
          timeSpent: Math.round((timeSpentRef.current / 60) * 10) / 10,
        }
      );

      // Update local state with new progress data
      const { progress, stats } = response.data;

      setProgressData((prev) => ({
        ...prev,
        completedLectures: [...prev.completedLectures, lectureId],
        stats: {
          ...prev.stats,
          completedLectures: stats.completedLectures,
          progressPercentage: stats.progressPercentage,
        },
      }));

      // Reset timer after marking complete
      timeSpentRef.current = 0;
    } catch (error) {
      console.error("Error marking lecture as completed:", error);
      alert("Failed to update progress. Please try again.");
    }
  };

  // Find the current lecture index
  const currentLectureIndex = lecturesList.findIndex(
    (lecture) => lecture._id === selectedLecture?._id
  );

  // Navigate to previous lecture
  const goToPreviousLecture = () => {
    if (currentLectureIndex > 0) {
      handleLectureSelect(lecturesList[currentLectureIndex - 1]);
    }
  };

  // Navigate to next lecture
  const goToNextLecture = () => {
    if (currentLectureIndex < lecturesList.length - 1) {
      handleLectureSelect(lecturesList[currentLectureIndex + 1]);
    }
  };

  // Handle lecture selection
  const handleLectureSelect = async (lecture) => {
    // Save time spent on previous lecture first
    if (trackingTime && timeSpentRef.current > 0) {
      await saveTimeSpent();
    }

    setSelectedLecture(lecture);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle complete and continue
  const completeAndContinue = async () => {
    if (currentLectureIndex < lecturesList.length - 1) {
      await markLectureCompleted(selectedLecture._id);
      goToNextLecture();
    } else {
      await markLectureCompleted(selectedLecture._id);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (lecturesList.length > 0 && searchTerm) {
      const filtered = lecturesList.filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lecture.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLectures(filtered);
    } else {
      setFilteredLectures(lecturesList);
    }
  }, [searchTerm, lecturesList]);

  // Auto-scroll selected lecture into view
  useEffect(() => {
    if (selectedLectureRef.current) {
      selectedLectureRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedLecture]);

  if (loading) {
    return (
      <div className="continue-learning-loading">
        <div className="loading-spinner"></div>
        <p>Loading course content...</p>
      </div>
    );
  }

  // Render error state
  if (error || !course) {
    return (
      <div className="continue-learning-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error || "Could not load the course."}</p>
        <Link to="/my-courses" className="back-link">
          <FaArrowLeft /> Back to My Courses
        </Link>
      </div>
    );
  }

  // Check if there are no lectures
  if (!filteredLectures || filteredLectures.length === 0) {
    return (
      <div className="continue-learning-empty">
        <h2>No Content Available</h2>
        <p>This course doesn't have any lectures yet.</p>
        <Link to="/my-courses" className="back-link">
          <FaArrowLeft /> Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="continue-learning-page">
      <div className="learning-header">
        <div className="header-left">
          <Link to="/my-courses" className="back-link">
            <FaArrowLeft /> My Courses
          </Link>
          <button
            className="toggle-sidebar-btn"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? "Hide Content" : "Show Content"}
          </button>
        </div>

        <div className="course-title">
          <h1>{course?.title}</h1>
        </div>

        <div className="overall-progress">
          <span>{progressData?.stats?.progressPercentage || 0}% Complete</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progressData?.stats?.progressPercentage || 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="learning-content">
        <div className={`lectures-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="lectures-header">
            <h2>Course Content</h2>
            <div className="lectures-count">
              <span>
                {progressData?.stats?.completedLectures || 0}/
                {progressData?.stats?.totalLectures || 0} completed
              </span>
            </div>
          </div>

          <div className="lecture-search">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="lectures-list">
            {searchTerm && filteredLectures.length === 0 ? (
              <div className="no-search-results">
                <p>No lectures match your search</p>
                <button onClick={() => setSearchTerm("")}>Clear Search</button>
              </div>
            ) : (
              filteredLectures.map((lecture, index) => {
                const isCompleted = progressData?.completedLectures?.includes(
                  lecture._id
                );
                const isSelected = selectedLecture?._id === lecture._id;

                return (
                  <div
                    key={lecture._id}
                    ref={isSelected ? selectedLectureRef : null}
                    className={`lecture-item ${
                      isCompleted ? "completed" : ""
                    } ${isSelected ? "selected" : ""}`}
                    onClick={() => handleLectureSelect(lecture)}
                  >
                    <div className="lecture-status">
                      {isCompleted ? (
                        <FaCheckCircle className="status-icon completed" />
                      ) : (
                        <FaCircle className="status-icon" />
                      )}
                    </div>
                    <div className="lecture-index">{index + 1}</div>
                    <div className="lecture-info">
                      <h3>{lecture.title}</h3>
                      <div className="lecture-meta">
                        <span className="lecture-type">
                          {lecture.type === "video" ? <FaPlay /> : <FaBook />}
                          {lecture.type === "video" ? "Video" : "Reading"}
                        </span>
                        <span className="lecture-duration">
                          <FaClock />
                          {lecture.duration} min
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lecture-content">
          {selectedLecture ? (
            <>
              <div className="lecture-header">
                <h2>{selectedLecture.title}</h2>
                <div className="lecture-actions">
                  {!progressData?.completedLectures?.includes(
                    selectedLecture._id
                  ) && (
                    <button
                      className="mark-complete-btn"
                      onClick={() => markLectureCompleted(selectedLecture._id)}
                    >
                      <FaCheckCircle />
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>

              <div className="lecture-navigation-tabs">
                <button
                  onClick={goToPreviousLecture}
                  className="nav-tab-btn"
                  disabled={currentLectureIndex <= 0}
                >
                  <FaArrowLeft /> Previous
                </button>

                <div className="lecture-position">
                  {currentLectureIndex + 1} / {lecturesList.length}
                </div>

                <button
                  onClick={goToNextLecture}
                  className="nav-tab-btn"
                  disabled={currentLectureIndex >= lecturesList.length - 1}
                >
                  Next <FaArrowRight />
                </button>
              </div>

              <div className="lecture-details">
                <div className="lecture-meta-details">
                  <div className="meta-item">
                    <FaClock />
                    <span>{selectedLecture.duration} minutes</span>
                  </div>
                  <div className="meta-item">
                    {selectedLecture.type === "video" ? <FaPlay /> : <FaBook />}
                    <span>
                      {selectedLecture.type === "video"
                        ? "Video lecture"
                        : "Reading material"}
                    </span>
                  </div>
                </div>

                <div className="lecture-description">
                  <h3>Description</h3>
                  <p>{selectedLecture.description}</p>
                </div>

                <div className="lecture-content-display">
                  {selectedLecture.type === "video" ? (
                    selectedLecture.videoUrl ? (
                      <div className="video-container">
                        <iframe
                          src={selectedLecture.videoUrl}
                          title={selectedLecture.title}
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="video-placeholder">
                        <FaPlay className="play-icon" />
                        <p>Video content unavailable</p>
                      </div>
                    )
                  ) : (
                    <div className="text-content">
                      {selectedLecture.content ? (
                        <div className="content-text">
                          {selectedLecture.content}
                        </div>
                      ) : (
                        <div className="content-placeholder">
                          <FaBook className="book-icon" />
                          <p>Reading content unavailable</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="lecture-navigation">
                  {!progressData?.completedLectures?.includes(
                    selectedLecture._id
                  ) && (
                    <button
                      className="complete-continue-btn"
                      onClick={completeAndContinue}
                    >
                      <FaCheckCircle />
                      {currentLectureIndex < lecturesList.length - 1
                        ? "Complete & Continue"
                        : "Complete Course"}
                    </button>
                  )}

                  {currentLectureIndex < lecturesList.length - 1 &&
                    progressData?.completedLectures?.includes(
                      selectedLecture._id
                    ) && (
                      <button
                        className="next-lecture-btn"
                        onClick={goToNextLecture}
                      >
                        Continue to Next Lecture <FaArrowRight />
                      </button>
                    )}

                  <Link
                    to={`/lecture/${selectedLecture._id}`}
                    className="view-lecture-btn"
                    onClick={() => saveTimeSpent()}
                  >
                    View Full Lecture
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="no-lecture-selected">
              <p>Select a lecture from the sidebar to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContinueLearning;
