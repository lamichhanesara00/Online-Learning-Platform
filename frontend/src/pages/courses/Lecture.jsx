import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Lecture = () => {
  const { courseId } = useParams();  // Get the courseId from the URL
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch lectures when the component mounts
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        // Replace with your correct API URL
        const response = await axios.get(`http://localhost:5000/api/admin/course/${courseId}/lectures`);
        setLectures(response.data);  // Set the fetched lectures data
        setLoading(false);  // Set loading to false once the data is fetched
      } catch (error) {
        setError('Failed to fetch lectures');
        setLoading(false);  // Set loading to false in case of error
      }
    };

    fetchLectures();
  }, [courseId]);  // Re-run this effect when the courseId changes

  if (loading) {
    return <div>Loading...</div>; // Show loading while fetching data
  }

  if (error) {
    return <div>{error}</div>; // Show error message if there was an issue fetching data
  }

  return (
    <div className="lecture-container">
      <h2>Lectures for Course {courseId}</h2>
      {lectures.length > 0 ? (
        <ul>
          {lectures.map((lecture) => (
            <li key={lecture._id}>
              <h3>{lecture.title}</h3>
              <p>{lecture.description}</p>
              <video controls>
                <source src={lecture.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </li>
          ))}
        </ul>
      ) : (
        <p>No lectures available for this course.</p>
      )}
    </div>
  );
};

export default Lecture;
