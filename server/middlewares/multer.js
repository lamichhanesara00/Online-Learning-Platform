// middlewares/multer.js
import multer from "multer";
import path from "path";

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(" ", "-"));
  },
});

// (Optional) Set file filter to accept only images (jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true); // Accept file
  } else {
    return cb(new Error("Only image files are allowed."), false); // Reject file
  }
};

// Initialize multer
const upload = multer({ storage, fileFilter });

// Export the multer instance for use in routes
export const uploadFiles = upload;
