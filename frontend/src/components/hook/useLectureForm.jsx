import { useState } from 'react';

const useLectureForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState('');

  // Reset form values
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideo('');
  };

  // Handle form submission
  const handleSubmit = (e, addLecture) => {
    e.preventDefault();
    if (!title || !description || !video) {
      alert('All fields are required');
      return;
    }

    addLecture({ title, description, video });
    resetForm();
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    video,
    setVideo,
    resetForm,
    handleSubmit,
  };
};

export default useLectureForm;
