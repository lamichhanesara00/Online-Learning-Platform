import { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
// No need to import login.css anymore

const Login = () => {
  const { loginUser, btnLoading, error, successMessage } = useUserData();
  const navigate = useNavigate();

  // State to handle input values and role selection
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role set to 'student'

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation for required fields
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Pass the email, password, and role to the login function
    loginUser(email, password, role, navigate);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-heading">Login</h2>

        {successMessage && <div className="auth-success">{successMessage}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={btnLoading}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={btnLoading}
          />

          <div className="auth-role-selection">
            <label className="auth-role-label">Select your role:</label>
            <div className="auth-role-options">
              <label className="auth-role-option">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={() => setRole("student")}
                />
                <span>Student</span>
              </label>
              <label className="auth-role-option">
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === "teacher"}
                  onChange={() => setRole("teacher")}
                />
                <span>Teacher</span>
              </label>
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={btnLoading}>
            {btnLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
