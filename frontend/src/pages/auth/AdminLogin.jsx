import { useState } from "react";
import { useUserData } from "../../context/UserContext";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [adminData, setAdminData] = useState({ email: "", password: "" });
  const { loginAdmin, btnLoading, error } = useUserData();

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Admin login data:", adminData);

    loginAdmin(adminData.email, adminData.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-heading">Admin Login</h2>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />

          <button className="auth-button" type="submit" disabled={btnLoading}>
            {btnLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an admin account?{" "}
          <Link to="/admin-register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
