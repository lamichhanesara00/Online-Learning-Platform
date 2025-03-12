import React, { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaKey } from "react-icons/fa";
import "./verify.css"; // Import updated CSS

const VerifyOtp = () => {
  const { verifyOtp, resendOtp, btnLoading, error } = useUserData();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !otp) {
      alert("Please enter your email and OTP.");
      return;
    }
    verifyOtp(email, otp);
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify Your Account</h2>
        <p className="verify-subtitle">Enter the OTP sent to your email</p>

        {/* ✅ Show Error Message */}
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label><FaEnvelope className="icon" /> Email</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={btnLoading}
            />
          </div>

          <div className="input-group">
            <label><FaKey className="icon" /> OTP</label>
            <input
              type="text"
              placeholder="Enter OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={btnLoading}
            />
          </div>

          <button type="submit" className="verify-btn" disabled={btnLoading}>
            {btnLoading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* ✅ Resend OTP */}
        <button className="resend-btn" onClick={() => resendOtp(email)} disabled={btnLoading}>
          Resend OTP
        </button>

        {/* ✅ Go to Login Page Link */}
        <p className="redirect-link">
          Go to <span onClick={() => navigate("/login")}>Login</span> page
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
