import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserData } from "../../context/UserContext";
import { FaUserCircle, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import "./header.css";

const Header = () => {
  const { isAuth, user, logoutUser } = useUserData();
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Update state if userRole changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("userRole"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setShowUserDropdown(false);
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Online-Learning</Link>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>

        {/* Show appropriate dashboard based on role */}
        {userRole === "teacher" && (
          <Link to="/teacher-dashboard">Teacher Dashboard</Link>
        )}
        {userRole === "student" && (
          <Link to="/student-dashboard">Student Dashboard</Link>
        )}
        {userRole === "admin" && (
          <Link to="/admin/dashboard">Admin Dashboard</Link>
        )}
      </nav>

      <div className="auth-section">
        {isAuth ? (
          <div className="user-dropdown-container">
            <div
              className="user-profile"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <FaUserCircle className="user-icon" />
              <span>{user?.name || "User"}</span>
              <FaChevronDown className="dropdown-icon" />
            </div>

            {showUserDropdown && (
              <div className="dropdown-menu user-menu">
                <Link to="/account" onClick={() => setShowUserDropdown(false)}>
                  My Account
                </Link>
                <Link
                  to="/my-courses"
                  onClick={() => setShowUserDropdown(false)}
                >
                  My Courses
                </Link>
                <Link to="/settings" onClick={() => setShowUserDropdown(false)}>
                  Settings
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="dropdown-container">
              <button
                className="dropdown-trigger"
                onMouseEnter={() => setShowLoginDropdown(true)}
                onMouseLeave={() => setShowLoginDropdown(false)}
              >
                Login <FaChevronDown className="dropdown-icon" />
              </button>

              {showLoginDropdown && (
                <div
                  className="dropdown-menu"
                  onMouseEnter={() => setShowLoginDropdown(true)}
                  onMouseLeave={() => setShowLoginDropdown(false)}
                >
                  <Link to="/login">Student/Teacher Login</Link>
                  <Link to="/admin-login">Admin Login</Link>
                </div>
              )}
            </div>

            <div className="dropdown-container">
              <button
                className="dropdown-trigger"
                onMouseEnter={() => setShowRegisterDropdown(true)}
                onMouseLeave={() => setShowRegisterDropdown(false)}
              >
                Register <FaChevronDown className="dropdown-icon" />
              </button>

              {showRegisterDropdown && (
                <div
                  className="dropdown-menu"
                  onMouseEnter={() => setShowRegisterDropdown(true)}
                  onMouseLeave={() => setShowRegisterDropdown(false)}
                >
                  <Link to="/register">Student/Teacher Register</Link>
                  <Link to="/admin-register">Admin Register</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
