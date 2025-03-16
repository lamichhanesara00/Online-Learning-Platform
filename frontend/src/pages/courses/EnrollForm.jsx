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
import { esewaCall, createSignature } from "../../utils/payment";
import "./enrollForm.css";

const EnrollForm = () => {
  const { id } = useParams();
  // grab query
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
  ); // 1: Info, 2: Payment, 3: Confirmation
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch course details
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

        // Pre-fill form with user data if available
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Move to payment step
  const handleContinueToPayment = (e) => {
    e.preventDefault();

    // Validate form fields
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

  // Handle payment with eSewa
  const handleEsewaPayment = () => {
    setProcessingPayment(true);
    setError(null);

    const signature = createSignature(
      `total_amount=${course.price},transaction_uuid=${id},product_code=EPAYTEST`
    );

    const paymentDetails = {
      amount: course.price.toString(),
      failure_url: "https://developer.esewa.com.np/failure",
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: "EPAYTEST",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
      success_url: "https://developer.esewa.com.np/success",
      tax_amount: "0",
      total_amount: course.price.toString(),
      transaction_uuid: "24102899",
    };
    console.log("🚀 ~ handleEsewaPayment ~ paymentDetails:", paymentDetails);

    esewaCall(paymentDetails);

    // First make post request to backend to store the payment details
    //  with those details, make a post request to eSewa
  };

  // Handle free course enrollment
  const handleFreeEnrollment = () => {
    setProcessingPayment(true);
    setError(null);

    setTimeout(() => {
      localStorage.setItem(`enrolled_${id}`, "true");
      setStep(3);
      setProcessingPayment(false);
    }, 1000);
  };

  // Go to course after successful enrollment
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

  // Render enrollment form (step 1)
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

  // Render payment options (step 2)
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
        <div className="summary-row total">
          <span>Total:</span>
          <span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
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
            className="esewa-button"
            onClick={handleEsewaPayment}
            disabled={processingPayment}
          >
            {processingPayment ? (
              <>
                <div className="button-spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <MdPayment className="esewa-icon" />
                <span>Pay with Esewa</span>
              </>
            )}
          </button>

          <div className="secure-payment">
            <FaLock /> Secure payment processed by eSewa
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

  // Render success confirmation (step 3)
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
