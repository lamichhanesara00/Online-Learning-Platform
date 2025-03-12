import Lecture from "../models/Lecture.js"; 

// Add Lecture Controller
export const addLecture = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newLecture = new Lecture({ title, description });
    await newLecture.save();
    res.status(201).json(newLecture);
  } catch (error) {
    res.status(500).json({ message: "Failed to add lecture" });
  }
};

// Get All Lectures Controller
export const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find();
    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch lectures" });
  }
};

// **Update Lecture Controller**
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );
    if (!updatedLecture) return res.status(404).json({ message: "Lecture not found" });
    res.status(200).json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: "Failed to update lecture" });
  }
};

// **Delete Lecture Controller**
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLecture = await Lecture.findByIdAndDelete(id);
    if (!deletedLecture) return res.status(404).json({ message: "Lecture not found" });
    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lecture" });
  }
};
