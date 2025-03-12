// middlewares/multer.js
import multer from "multer";
import path from "path";

// 1. Configure storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// 2. (Optional) File filter if you want to allow only images, etc.
const fileFilter = (req, file, cb) => {
  // for demonstration, accept everything
  cb(null, true);
};

// 3. Create the Multer instance
const upload = multer({ storage, fileFilter });

// 4. Named export
export const uploadFiles = upload;
