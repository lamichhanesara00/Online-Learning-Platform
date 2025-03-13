// models/createcourse.js
import mongoose from 'mongoose';

const createCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructor: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },  // Image field to store image path
});

const CreateCourse = mongoose.model('CreateCourse', createCourseSchema);

export default CreateCourse;
