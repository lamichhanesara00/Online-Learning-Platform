import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import About from "./pages/about/About";
import Account from "./pages/account/Account";
import Courses from "./pages/courses/Courses";
import ViewFeedback from "./components/Feedback/Feedback";
import ChatBox from "./components/chat/ChatBox";
import StudentLogin from "./pages/auth/StudentLogin";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminRegister from "./pages/auth/AdminRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddLecture from "./pages/admin/AddLecture";
import DashboardUser from "./pages/dashboard/Dashboard";
import CreateCourse from "./pages/courses/CreateCourse";
import "./App.css";
import CourseDetails from "./pages/courses/CourseDetails";
import EnrollForm from "./pages/courses/EnrollForm";
import CreateLecture from "./pages/courses/CreateLecture";
import LectureDetails from "./pages/courses/LectureDetails";
import UpdateLecture from "./pages/courses/UpdateLecture";
import MyCourses from "./pages/courses/MyCourses";
import ContinueLearning from "./pages/courses/ContinueLearning";

//  Protect Admin Routes
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("userRole");
  return isAuthenticated ? children : <Navigate to="/admin-login" />;
};

// ✅ Protect Teacher Routes
const TeacherRoute = ({ children }) => {
  const isTeacher = localStorage.getItem("userRole") === "teacher";
  return isTeacher ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<Verify />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/create/courses" element={<CreateCourse />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/edit-course/:id" element={<CreateCourse />} />
        <Route path="/course/:id/learn" element={<ContinueLearning />} />
        <Route path="/course/:courseId/feedback" element={<ViewFeedback />} />
        <Route path="/course/:id/enroll" element={<EnrollForm />} />
        <Route
          path="/course/:courseId/lectures/add"
          element={<CreateLecture />}
        />
        <Route path="lecture/:id/edit" element={<UpdateLecture />} />
        <Route path="/lecture/:id" element={<LectureDetails />} />

        {/* ✅ FIXED: Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <TeacherRoute>
              <DashboardUser />
            </TeacherRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/add-lecture"
          element={
            <PrivateRoute>
              <AddLecture />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
      <ChatBox />
    </>
  );
};

export default App;
