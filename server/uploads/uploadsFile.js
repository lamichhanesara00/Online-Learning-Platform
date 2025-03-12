// uploadFile.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function uploadFile() {
  try {
    // 1. Path to your image file
    const imagePath = "./uploads/Screenshot 2025-02-22 142029.png";
    
    // 2. Create FormData instance
    const formData = new FormData();
    
    // 3. Append text fields (optional)
    formData.append("title", "Online Learning Platform");
    formData.append("description", "Nice course description");
    formData.append("price", "100");
    formData.append("category", "Programming");
    formData.append("instructor", "John Doe");
    formData.append("duration", "4");
    
    // 4. Append the file
    //    The first argument (e.g., "cover") must match the field name your server expects:
    //    If your server uses `upload.single("cover")`, then use "cover" here.
    formData.append("cover", fs.createReadStream(imagePath));

    // 5. Send POST request to your server
    //    Make sure this matches the actual route & port your server listens on.
    //    For example: http://localhost:5000/api/course/create
    const response = await axios.post("http://localhost:5000/api/course/create", formData, {
      headers: formData.getHeaders(),
    });

    console.log("✅ Upload Successful:", response.data);
  } catch (error) {
    console.error("❌ Upload Failed:", error.response?.data || error.message);
  }
}

uploadFile();
