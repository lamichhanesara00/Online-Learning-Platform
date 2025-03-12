import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const server = "http://localhost:5000"; // Adjust if needed
const UserContext = createContext(null);

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [activationToken, setActivationToken] = useState(null); // ✅ Store activation token
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /** ✅ Fetch User Profile */
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("❌ No token found. User not authenticated.");
        setLoading(false);
        return;
      }

      console.log("🔄 Fetching User Profile...");
      const { data } = await axios.get(`${server}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.error("❌ Error fetching user:", error?.response?.data || error.message);
      if (error.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Register User */
  const registerUser = async (name, email, password) => {
    setBtnLoading(true);
    setError(null);
  
    try {
      const { data } = await axios.post(`${server}/api/user/register`, { name, email, password });
  
      // ✅ Store activation token for OTP verification
      setActivationToken(data.activationToken);
      localStorage.setItem("activationToken", data.activationToken); // ✅ Store for persistence
  
      alert("✅ User registered successfully! Check your email for OTP.");
      
      setTimeout(() => {
        navigate("/verify-otp");
      }, 2000);
    } catch (error) {
      console.error("❌ Registration error:", error.response?.data || error.message);
  
      if (error.response?.status === 400) {
        setError(error.response.data.message || "User already exists.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setBtnLoading(false); // ✅ Ensure button resets after request
    }
  };
  
  /** ✅ Verify OTP */
  const verifyOtp = async (email, otp) => {
    setBtnLoading(true);
    setError(null);

    const storedActivationToken = activationToken || localStorage.getItem("activationToken");

    if (!storedActivationToken) {
      setError("Activation token missing. Please register again.");
      setBtnLoading(false); // ✅ Reset loading state
      return;
    }

    try {
      const { data } = await axios.post(`${server}/api/user/verify-otp`, {
        email,
        otp,
        activationToken: storedActivationToken,
      });

      alert("✅ OTP Verified Successfully! Redirecting to login...");
      localStorage.removeItem("activationToken");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("❌ OTP Verification error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setBtnLoading(false); // ✅ Ensure button resets
    }
  };

  /** ✅ Login User */
  const loginUser = async (email, password) => {
    setBtnLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${server}/api/user/login`, { email, password });

      localStorage.setItem("token", data.token);
      setIsAuth(true);
      setTimeout(async () => {
        await fetchUser();
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      setError("Invalid email or password. Please try again.");
    } finally {
      setBtnLoading(false); // ✅ Ensure button resets
    }
  };

  /** ✅ Resend OTP */
  const resendOtp = async (email) => {
    setBtnLoading(true);
    setError(null);

    try {
      await axios.post(`${server}/api/user/resend-otp`, { email });

      alert("✅ New OTP sent to your email.");
    } catch (error) {
      console.error("❌ Resend OTP error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setBtnLoading(false); // ✅ Ensure button resets
    }
  };

  /** ✅ Logout User */
  const logoutUser = () => {
    console.warn("🚪 Logging out user...");
    localStorage.removeItem("token");
    localStorage.removeItem("activationToken"); // ✅ Clear activation token on logout
    setUser(null);
    setIsAuth(false);
    navigate("/login");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuth, 
      registerUser, 
      verifyOtp, 
      resendOtp, 
      loginUser, 
      logoutUser, 
      activationToken, // ✅ Provide activation token in context
      btnLoading, 
      error 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserContextProvider");
  }
  return context;
};
