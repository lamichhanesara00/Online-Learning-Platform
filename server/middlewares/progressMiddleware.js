import Progress from "../models/progress.js";  // Assuming the model is in the models folder

// Middleware to verify progress (ensure the student has progress)
export const verifyProgress = async (req, res, next) => {
  const { studentId, courseId } = req.params;  // You will be passing both studentId and courseId in the URL

  if (!studentId || !courseId) {
    return res.status(400).json({ message: "Missing student or course ID." });
  }

  try {
    // Check if the student has progress for the given course
    const progress = await Progress.findOne({ studentId, courseId });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found for this student in the course." });
    }

    // If progress is found, attach it to the request object
    req.progress = progress;
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in progress middleware:", error);
    return res.status(500).json({ message: "Error verifying progress", error });
  }
};
