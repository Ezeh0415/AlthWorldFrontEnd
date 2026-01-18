import React, { useState } from "react";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  MailOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import "../../styles/Admin/AdminSignUp.css";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check required fields
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log form data to console
      console.log("🔐 ADMIN LOGIN SUBMITTED:", {
        email: formData.email,
        password: "***HIDDEN***",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Show success message
      setSuccess(true);

      // Reset form after 3 seconds (in real app, you would redirect)
      setTimeout(() => {
        setFormData({
          email: "",
          password: "",
        });
        setSuccess(false);
        // In real app: window.location.href = "/admin/dashboard";
        console.log("Redirecting to admin dashboard...");
      }, 3000);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ submit: "Failed to login. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-signup-container">
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <div className="logo-section">
            <div className="logo-icon">
              <SafetyCertificateOutlined />
            </div>
            <div className="logo-text">
              <h1>Admin Login</h1>
              <p>Sign in to your administrator account</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircleOutlined className="success-icon" />
            <div>
              <h3>Login Successful!</h3>
              <p>Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">
              <MailOutlined />
              <span>Email Address</span>
              {errors.email && <span className="error-indicator">!</span>}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className={errors.email ? "error" : ""}
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <LockOutlined />
              <span>Password</span>
              {errors.password && <span className="error-indicator">!</span>}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={errors.password ? "error" : ""}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/admin/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <LoadingOutlined spin />
                  Signing In...
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>

            <div className="signin-link">
              Don't have an account? <Link to="/AdminSignUp">Sign Up</Link>
            </div>
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default AdminLogin;
