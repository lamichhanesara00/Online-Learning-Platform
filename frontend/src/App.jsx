import { Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import Courses from "./pages/courses/Courses";
import Lecture from "./pages/courses/Lecture";
import ViewFeedback from "./components/Feedback/Feedback";
import ChatBox from "./components/chat/ChatBox";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminLogin from "./pages/auth/AdminLogin"; 
import AdminRegister from "./pages/auth/AdminRegister";

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<Verify />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId/lectures" element={<Lecture />} />
        <Route path="/course/:courseId/feedback" element={<ViewFeedback />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} /> {/* ✅ Admin Login Route */}
      </Routes>
      <Footer />
      <ChatBox />
    </>
  );
};

export default App;
