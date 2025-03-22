import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaImage, FaSave } from "react-icons/fa";
import "./createcourse.css";

const CreateCourse = () => {
  const { id } = useParams(); // Get course ID if editing
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    duration: "",
    price: "",
  });

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch course data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/api/courses/${id}`
          );
          const course = response.data;

          setFormData({
            title: course.title,
            instructor: course.instructor,
            duration: course.duration,
            price: course.price,
          });

          // Set preview for existing image
          if (course.image) {
            setPreviewUrl(
              course.image.startsWith("http")
                ? course.image
                : `http://localhost:5000/${course.image}`
            );
          }

          setLoading(false);
        } catch (error) {
          console.error("Error fetching course:", error);
          setError("Failed to load course data. Please try again.");
          setLoading(false);
        }
      };

      fetchCourse();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const courseData = new FormData();
      courseData.append("title", formData.title);
      courseData.append("instructor", formData.instructor);
      courseData.append("duration", formData.duration);
      courseData.append("price", formData.price);

      // Only append image if it exists (new or changed)
      if (image) {
        courseData.append("image", image);
      }

      // Configure axios request with proper headers for file upload
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      let response;
      if (isEditMode) {
        // Update existing course with file upload configuration
        response = await axios.put(
          `http://localhost:5000/api/courses/${id}`,
          courseData,
          config
        );
        setSuccess("Course updated successfully!");
      } else {
        // Create new course with file upload configuration
        response = await axios.post(
          "http://localhost:5000/api/courses",
          courseData,
          config
        );
        setSuccess("Course created successfully!");
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate("/courses");
      }, 1500);
    } catch (error) {
      console.error("Error saving course:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="create-course-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate("/courses")}>
          <FaArrowLeft /> Back to Courses
        </button>
        <h1>{isEditMode ? "Edit Course" : "Create New Course"}</h1>
        <p className="subtitle">
          {isEditMode
            ? "Update your course information below"
            : "Fill out the form below to create a new course"}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="create-course-container">
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="instructor">Instructor Name</label>
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Enter instructor name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration in hours"
                required
                min="0"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price (0 for free)"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group image-upload">
            <label htmlFor="image">
              <div className={`upload-area ${previewUrl ? "has-preview" : ""}`}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Course preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <FaImage className="upload-icon" />
                    <span>Click to select course image</span>
                  </div>
                )}
              </div>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="hidden-input"
              required={!isEditMode && !previewUrl}
            />
            <div className="file-name">
              {image
                ? image.name
                : previewUrl
                ? "Current image"
                : "No file selected"}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <div className="button-spinner"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{isEditMode ? "Update Course" : "Create Course"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
