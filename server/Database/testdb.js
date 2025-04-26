import mongoose from "mongoose";

// MongoDB Connection String
const mongoURI =
  "mongodb+srv://sara:sara123@cluster0.olc85.mongodb.net/onlineLearningTest?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Sample Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "user" },
});

const User = mongoose.model("User", UserSchema);

// Insert a Test User
const testUser = new User({
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword123",
  role: "admin",
});

testUser
  .save()
  .then(() => console.log("✅ Test User Inserted"))
  .catch((err) => console.error("❌ Error inserting user:", err));
