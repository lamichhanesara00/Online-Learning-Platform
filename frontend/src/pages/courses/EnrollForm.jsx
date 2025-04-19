import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import { useUserData } from "../../context/UserContext";
import {
  FaArrowLeft,
  FaLock,
  FaCreditCard,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import "./enrollForm.css";

const EnrollForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuth, user } = useUserData();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    agreeToTerms: false,
  });
  const [step, setStep] = useState(
    searchParams.get("step") ? parseInt(searchParams.get("step")) : 1
  );
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!isAuth) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/courses/${id}`
        );
        setCourse(response.data);

        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || "",
            email: user.email || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, isAuth, navigate, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setError(null);
    setStep(2);
  };

  const handleKhaltiPayment = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      // Call the Khalti payment initiation API
      const response = await axios.post(
        "http://localhost:5000/api/payments/khalti/initiate",
        {
          courseId: id,
          user: user,
        }
      );

      if (response.data.success) {
        // Redirect to Khalti payment page
        window.location.href = response.data.data.paymentUrl;
      } else {
        setError(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to process payment"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // Add a new function to verify payment status
  const verifyPayment = async (pidx) => {
    try {
      setProcessingPayment(true);

      const response = await axios.post(
        "http://localhost:5000/api/payments/khalti/verify",
        {
          pidx: pidx,
          courseId: id,
        }
      );

      if (response.data.success) {
        if (response.data.data.payment.status === "completed") {
          setStep(3); // Move to confirmation step
        } else {
          setError(
            "Your payment is still being processed. Please try again later."
          );
        }
      } else {
        setError(response.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to verify payment"
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  // Add a useEffect to check for payment confirmations from redirects
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const pidx = searchParams.get("pidx");
      const status = searchParams.get("status");

      if (pidx && status) {
        // Payment return from Khalti
        if (status === "Completed") {
          await verifyPayment(pidx);
        } else {
          setError(`Payment ${status.toLowerCase()}. Please try again.`);
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  const handleFreeEnrollment = () => {
    setProcessingPayment(true);
    setError(null);

    setTimeout(() => {
      localStorage.setItem(`enrolled_${id}`, "true");
      setStep(3);
      setProcessingPayment(false);
    }, 1000);
  };

  const handleGoToCourse = () => {
    navigate(`/course/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="enroll-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="enroll-error">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <Link to={`/course/${id}`} className="back-link">
          <FaArrowLeft /> Back to course
        </Link>
      </div>
    );
  }

  const renderEnrollmentForm = () => (
    <div className="enrollment-form-container">
      <h2>Enrollment Information</h2>

      {error && <div className="enroll-error-message">{error}</div>}

      <form onSubmit={handleContinueToPayment}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 9812345678"
            required
          />
        </div>

        <div className="form-checkbox">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreeToTerms">
            I agree to the{" "}
            <a href="/terms" target="_blank">
              terms and conditions
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={!formData.agreeToTerms}
          className="continue-button"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );

  const renderPaymentOptions = () => (
    <div className="payment-options-container">
      <h2>Select Payment Method</h2>

      {error && <div className="enroll-error-message">{error}</div>}

      <div className="payment-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Course Fee:</span>
          <span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
        </div>
        <div className="summary-row">
          <span>Tax (13%):</span>
          <span>
            {course.price === 0
              ? "Free"
              : `$${(course.price * 0.13).toFixed(2)}`}
          </span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>
            {course.price === 0
              ? "Free"
              : `$${(course.price * 1.13).toFixed(2)}`}
          </span>
        </div>
      </div>

      {course.price === 0 ? (
        <button
          className="free-enroll-button"
          onClick={handleFreeEnrollment}
          disabled={processingPayment}
        >
          {processingPayment ? "Processing..." : "Enroll Now - Free"}
        </button>
      ) : (
        <div className="payment-methods">
          <button
            className="khalti-button"
            onClick={handleKhaltiPayment}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <>
                <div className="button-spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <MdPayment className="khalti-icon" />
                <span>Pay with Khalti</span>
              </>
            )}
          </button>

          <div className="secure-payment">
            <FaLock /> Secure payment processed by Khalti
          </div>
        </div>
      )}

      <button
        className="back-to-info"
        onClick={() => setStep(1)}
        disabled={processingPayment}
      >
        <FaArrowLeft /> Back to Information
      </button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="enrollment-success-container">
      <div className="success-icon">
        <FaCheckCircle />
      </div>

      <h2>Enrollment Successful!</h2>
      <p>
        You have successfully enrolled in <strong>{course.title}</strong>.
      </p>

      <div className="enrollment-details">
        <div className="detail-row">
          <FaInfoCircle />
          <span>You now have lifetime access to this course</span>
        </div>
        <div className="detail-row">
          <FaCreditCard />
          <span>
            {course.price === 0
              ? "Free enrollment"
              : `Payment of $${course.price} processed successfully`}
          </span>
        </div>
      </div>

      <button className="access-course-button" onClick={handleGoToCourse}>
        Start Learning Now
      </button>

      <Link to="/courses" className="browse-more-link">
        Browse More Courses
      </Link>
    </div>
  );

  return (
    <div className="enroll-page">
      <div className="enroll-nav">
        <button onClick={() => navigate(-1)} className="back-to-course">
          <FaArrowLeft /> Back to course details
        </button>
      </div>

      {course && (
        <div className="enroll-header">
          <h1>Enroll in {course.title}</h1>
          <div className="course-brief">
            <div className="course-brief-price">
              {course.price === 0 ? (
                <span className="free-tag">Free</span>
              ) : (
                <span>${course.price}</span>
              )}
            </div>
            <div className="course-brief-instructor">
              Instructor: {course.instructor}
            </div>
            <div className="course-brief-duration">
              Duration: {course.duration} hours
            </div>
          </div>
        </div>
      )}

      <div className="enroll-progress">
        <div className={`progress-step ${step >= 1 ? "active" : ""}`}>
          <div className="step-number">1</div>
          <span>Information</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? "active" : ""}`}>
          <div className="step-number">2</div>
          <span>Payment</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 3 ? "active" : ""}`}>
          <div className="step-number">3</div>
          <span>Confirmation</span>
        </div>
      </div>

      <div className="enroll-content">
        {step === 1 && renderEnrollmentForm()}
        {step === 2 && renderPaymentOptions()}
        {step === 3 && renderConfirmation()}
      </div>
    </div>
  );
};

export default EnrollForm;
