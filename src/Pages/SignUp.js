import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/ChatGPT Image Jan 22, 2026, 12_37_21 AM.png";
import "../styles/SignUp.css";

const Base_url =
  process.env.REACT_APP_API_URL || "https://althworldbackend.onrender.com/api/";
const Base_Api =
  process.env.REACT_APP_API_KEY ||
  "373f70230eca4c6de0573179c5abc9091b84dfd8b7894265402f0856a02f49b9";

const Signup = () => {
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    privacyAccepted: false,
    captcha: "",
    captchaText: generateCaptcha(),
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate random CAPTCHA
  function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle input blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Field validation
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "This field is required";
        else if (value.length < 2) error = "Must be at least 2 characters";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;

      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Must be at least 8 characters";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          error = "Must include uppercase, lowercase, and number";
        break;

      case "captcha":
        if (!value) error = "CAPTCHA is required";
        else if (value.toUpperCase() !== formData.captchaText)
          error = "Incorrect CAPTCHA code";
        break;

      case "privacyAccepted":
        if (!value) error = "You must accept the terms";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key !== "captchaText") {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = validateField(key, formData[key]) ? "" : "Error";
        }
        if (errors[key]) isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Refresh CAPTCHA
  const refreshCaptcha = () => {
    setFormData((prev) => ({
      ...prev,
      captchaText: generateCaptcha(),
      captcha: "",
    }));
    setErrors((prev) => ({ ...prev, captcha: "" }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "captchaText") allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // In real app, you would call your API here:
      const response = await fetch(`${Base_url}signup?key=${Base_Api}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.firstName,
          userName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      // ❌ handle error response properly
      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.message || "❌ Form submission error");
        return;
      }

      // ✅ parse response body
      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data));

      Navigate("/");
      // Reset form on success
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        privacyAccepted: false,
        captcha: "",
        captchaText: generateCaptcha(),
      });
      setErrors({});
      setTouched({});
    } catch (error) {
      setErrors("❌ Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-logo-section">
          <img src={logo} alt="Logo" className="signup-logo" />
          <h2>Create Account</h2>
          <p className="signup-subtitle">Join our platform to get started</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* Name Fields */}
          <div className="name-fields">
            <div className="input-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.firstName && touched.firstName ? "error" : ""}
                required
              />
              {errors.firstName && touched.firstName && (
                <div className="error-message show">{errors.firstName}</div>
              )}
            </div>

            <div className="input-group">
              <label>
                UserName <span className="required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.lastName && touched.lastName ? "error" : ""}
                required
              />
              {errors.lastName && touched.lastName && (
                <div className="error-message show">{errors.lastName}</div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="input-group">
            <label>
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email && touched.email ? "error" : ""}
              required
            />
            {errors.email && touched.email && (
              <div className="error-message show">{errors.email}</div>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label>
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Password must Be capital and small letter"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password && touched.password ? "error" : ""}
              required
            />
            {errors.password && touched.password && (
              <div className="error-message show">{errors.password}</div>
            )}
          </div>

          {/* Confirm Password */}
          {/* <div className="input-group">
            <label>
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.confirmPassword && touched.confirmPassword ? "error" : ""
              }
              required
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="error-message show">{errors.confirmPassword}</div>
            )}
          </div> */}

          {/* Privacy Policy Checkbox */}
          <div className="privacy-checkbox">
            <input
              type="checkbox"
              id="privacy"
              name="privacyAccepted"
              checked={formData.privacyAccepted}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <label htmlFor="privacy">
              I accept the{" "}
              <Link to="/privacy" target="_blank">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" target="_blank">
                Terms of Service
              </Link>
            </label>
            {errors.privacyAccepted && touched.privacyAccepted && (
              <div className="error-message show" style={{ marginTop: "4px" }}>
                {errors.privacyAccepted}
              </div>
            )}
          </div>

          {/* CAPTCHA */}
          <div className="captcha-container">
            <div className="captcha-box">
              <div className="captcha-text">{formData.captchaText}</div>
              <button
                type="button"
                className="refresh-captcha"
                onClick={refreshCaptcha}
                aria-label="Refresh CAPTCHA"
              >
                ↻ Refresh
              </button>
            </div>
            <input
              type="text"
              name="captcha"
              className={`captcha-input ${
                errors.captcha && touched.captcha ? "error" : ""
              }`}
              placeholder="Enter the code above"
              value={formData.captcha}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="6"
              required
            />
            {errors.captcha && touched.captcha && (
              <div className="error-message show">{errors.captcha}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`signup-btn ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account?{" "}
          <Link to="/login" className="link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
