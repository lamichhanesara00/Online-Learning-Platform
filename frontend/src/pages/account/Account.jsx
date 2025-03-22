import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../../context/UserContext";
import { IoMdLogOut } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa"; // ✅ Import Student Icon
import ChatBox from "../../components/chat/ChatBox"; // ✅ Import Chat Box Component
import "./account.css";

const Account = () => {
  const { user, isAuth, logoutUser, userRole } = useUserData();
  const navigate = useNavigate();
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";

  const handleLogout = () => {
    logoutUser(navigate); // ✅ Ensuring navigation on logout
  };

  if (!isAuth) {
    return (
      <div className="error-container">
        <h2 className="error-message">Access Denied</h2>
        <p>You must be logged in to access this page.</p>
        <Link to="/login" className="login-redirect">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="profile-card">
        <h2>My Profile</h2>
        <p>
          <strong>Name:</strong> {user?.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user?.email || "N/A"}
        </p>

        <div className="button-group">
          {isStudent && (
            // Browse courses button
            <Link to="/courses">
              <button className="course-btn">
                <FaUserGraduate size={20} /> Browse Courses
              </button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin-dashboard">
              <button className="dashboard-btn">
                <MdDashboard size={20} /> Dashboard
              </button>
            </Link>
          )}
          {/* Your course button */}
          <Link to="/my-courses">
            <button className="course-btn">
              <FaUserGraduate size={20} /> My Courses
            </button>
          </Link>

          <button className="logout-btn" onClick={handleLogout}>
            <IoMdLogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <ChatBox />
    </div>
  );
};

export default Account;
