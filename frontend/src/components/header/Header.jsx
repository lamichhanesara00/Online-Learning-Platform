import React from "react";
import { Link } from "react-router-dom";
import { useUserData } from "../../context/UserContext"; // ✅ Import User Context
import "./header.css";

const Header = () => {
  const { isAuth, user } = useUserData(); // ✅ Get user data

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Online-Learning</Link>
      </div>
      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>

        {/* ✅ New "Lectures" Link */}
        <Link to="/add-lecture">Lectures</Link>

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
