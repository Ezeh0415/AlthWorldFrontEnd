import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import logo from "../Assets/logo.svg";

// You should define these in a config file
const Base_url = process.env.REACT_APP_API_URL;
const Base_Api = process.env.REACT_APP_API_KEY;

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear API error
    if (apiError) setApiError("");
  };

  // Handle remember me checkbox
  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login with database
  const handleLogin = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Save username if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      // Make API call to database
      const response = await fetch(`${Base_url}login?key=${Base_Api}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userName: formData.username,
          password: formData.password,
        }),
      });

      const contentType = response.headers.get("content-type");
      let responseData;

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        // Handle API errors
        let errorMessage = "Login failed. Please try again.";

        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (response.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (response.status === 404) {
          errorMessage = "User not found";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        setApiError(errorMessage);
        setIsSubmitting(false);
        return;
      }

      // Handle successful login
      console.log("✅ Login successful!");

      // Extract user data from response (adjust based on your API)
      const userData = responseData.data || responseData.user || responseData;
      const token = responseData.token || responseData.accessToken;

      // Store authentication data
      
      if (token) {
        localStorage.setItem("userToken", token);
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(userData));

      // Store login timestamp
      localStorage.setItem("loginTimestamp", new Date().toISOString());

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("💥 Login Error:", error);

      // Handle network errors
      if (error.name === "TypeError") {
        setApiError("Network error. Please check your connection.");
        setIsSubmitting(false);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }

      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
    // Navigate to forgot password page
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Crypto Invest Logo" className="login-logo" />

        <h2>Welcome Back</h2>
        <p className="login-subtitle">
          Log in to manage your crypto investments
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "error" : ""}
              disabled={isSubmitting}
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex="-1"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMe}
                disabled={isSubmitting}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={handleForgotPassword}
              disabled={isSubmitting}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className={`login-btn ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link className="link" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
