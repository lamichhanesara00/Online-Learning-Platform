import { useState, useEffect } from 'react';
import axios from 'axios';

const useLectures = (courseId) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch lectures
  const fetchLectures = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/admin/course/${courseId}/lectures`);
      setLectures(data);  // Store fetched lectures
    } catch (err) {
      setError('Failed to fetch lectures.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new lecture
  const addLecture = async (newLecture) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`http://localhost:5000/api/admin/course/${courseId}/lectures`, newLecture);
      fetchLectures();  // Re-fetch lectures after adding a new one
    } catch (err) {
      setError('Failed to add lecture.');
    } finally {
      setLoading(false);
    }
  };

  // Use effect to fetch lectures when component mounts or courseId changes
  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  return {
    lectures,
    loading,
    error,
    addLecture,
  };
};

export default useLectures;
