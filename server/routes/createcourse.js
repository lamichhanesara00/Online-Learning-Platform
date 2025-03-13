// routes/createcourse.js
import express from 'express';
import { uploadFiles } from '../middlewares/multer.js';  // Import multer
import CreateCourse from '../models/createcourse.js';  // Import CreateCourse model

const router = express.Router();

// Define the POST route for creating a course
router.post('/api/courses', uploadFiles.single('image'), async (req, res) => {
  const { title, instructor, duration, price } = req.body;
  const image = req.file ? req.file.path : null;  // Get image file path after upload

  if (!image) {
    return res.status(400).json({ message: 'Image is required.' });
  }

  try {
    const newCourse = new CreateCourse({
      title,
      instructor,
      duration,
      price,
      image,
    });

    await newCourse.save();  // Save course to the database
    res.status(201).json({ message: 'Course Created Successfully!' });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: 'Failed to create course.' });
  }
});

export default router;
