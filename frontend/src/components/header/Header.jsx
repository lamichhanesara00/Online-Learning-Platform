import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserData } from "../../context/UserContext"; // ✅ Import User Context
import "./header.css";

const Header = () => {
  const { isAuth, user } = useUserData(); // ✅ Get user data
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  // ✅ Update state if userRole changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Online-Learning</Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>

        {/* ✅ Show Teacher Dashboard only for teachers */}
        {userRole === "teacher" && (
          <Link to="/teacher-dashboard">Teacher Dashboard</Link>
        )}

        {/* ✅ Show Student Dashboard only for students */}
        {userRole === "student" && (
          <Link to="/student-dashboard">Student Dashboard</Link>
        )}

        {/* ✅ Show Account when logged in */}
        {isAuth ? (
          <Link to="/account">Account</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}

        {/* ✅ Show Admin Login for non-admin users */}
        {!isAuth || (user && user.role !== "admin") ? (
          <Link to="/admin-login">Admin Login</Link>
        ) : null}
      </nav>
    </header>
  );
};

export default Header;
