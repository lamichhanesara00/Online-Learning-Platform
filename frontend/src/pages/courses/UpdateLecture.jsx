import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaVideo, FaArrowLeft, FaSave, FaClock, FaBook } from "react-icons/fa";
import "./createLecture.css";

const UpdateLecture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    videoUrl: "",
    content: "",
    lectureType: "video", // Default to video type
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lecture, setLecture] = useState(null);

  // Fetch course details to display in the header
  useEffect(() => {
    const fetchLectureDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token =
          localStorage.getItem("token") || localStorage.getItem("adminToken");
        const response = await axios.get(
          `http://localhost:5000/api/lectures/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setLecture(response.data);
        setFormData({
          title: response.data.title,
          description: response.data.description,
          duration: response.data.duration,
          videoUrl: response.data.videoUrl || "",
          content: response.data.content || "",
          lectureType: response.data.type,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching lecture details:", err);
        setError("Failed to load lecture details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectureDetails();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getVideoId = (url) => {
    const videoId = url.split("v=")[1];
    const ampersandPosition = videoId.indexOf("&");
    if (ampersandPosition !== -1) {
      return videoId.substring(0, ampersandPosition);
    }
    return videoId;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.duration
    ) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    // Validate lecture content based on type
    if (formData.lectureType === "video" && !formData.videoUrl.trim()) {
      setError("Please provide a valid video URL.");
      setSubmitting(false);
      return;
    }

    if (formData.lectureType === "text" && !formData.content.trim()) {
      setError("Please provide lecture content.");
      setSubmitting(false);
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("adminToken");
      const requestData = {
        title: formData.title,
        description: formData.description,
        duration: parseFloat(formData.duration),
        type: formData.lectureType,
        videoUrl:
          formData.lectureType === "video"
            ? getVideoId(formData.videoUrl)
            : null,
        content: formData.lectureType === "text" ? formData.content : null,
      };

      const response = await axios.put(
        `http://localhost:5000/api/lectures/${id}`,
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Lecture updated successfully!");
      setFormData({
        title: "",
        description: "",
        duration: "",
        videoUrl: "",
        content: "",
        lectureType: "video",
      });

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(`/lecture/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error creating lecture:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create lecture. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle going back to course page
  const handleBack = () => {
    navigate(`/course`);
  };

  if (loading) {
    return (
      <div className="lecture-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading lecture details...</p>
      </div>
    );
  }

  return (
    <div className="create-lecture-page">
      <div className="lecture-form-header">
        <button className="back-button" onClick={handleBack}>
          <FaArrowLeft /> Back to Course
        </button>
        <h1>Update Lecture</h1>
      </div>

      {error && <div className="lecture-error-message">{error}</div>}
      {success && <div className="lecture-success-message">{success}</div>}

      <div className="lecture-form-container">
        <form onSubmit={handleSubmit} className="lecture-form">
          <div className="form-group">
            <label htmlFor="title">
              Lecture Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter lecture title"
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter lecture description"
              disabled={submitting}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="duration">
              Duration (minutes) <span className="required">*</span>
            </label>
            <div className="input-with-icon">
              <FaClock className="input-icon" />
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration in minutes"
                disabled={submitting}
                min="1"
                step="0.5"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Lecture Type <span className="required">*</span>
            </label>
            <div className="lecture-type-selector">
              <div
                className={`type-option ${
                  formData.lectureType === "video" ? "selected" : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, lectureType: "video" })
                }
              >
                <FaVideo className="type-icon" />
                <span>Video</span>
              </div>
              <div
                className={`type-option ${
                  formData.lectureType === "text" ? "selected" : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, lectureType: "text" })
                }
              >
                <FaBook className="type-icon" />
                <span>Text</span>
              </div>
            </div>
          </div>

          {formData.lectureType === "video" && (
            <div className="form-group">
              <label htmlFor="videoUrl">
                Video URL <span className="required">*</span>
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="Enter YouTube or Vimeo URL"
                disabled={submitting}
                required
              />
              <small className="form-help-text">
                Paste a YouTube or Vimeo video URL (e.g.,
                https://www.youtube.com/watch?v=XXXX)
              </small>
            </div>
          )}

          {formData.lectureType === "text" && (
            <div className="form-group">
              <label htmlFor="content">
                Lecture Content <span className="required">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter lecture content (supports markdown)"
                className="content-textarea"
                disabled={submitting}
                required
              ></textarea>
              <small className="form-help-text">
                You can use Markdown formatting for rich text
              </small>
            </div>
          )}

          <button
            type="submit"
            className="submit-lecture-button"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="button-spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateLecture;
