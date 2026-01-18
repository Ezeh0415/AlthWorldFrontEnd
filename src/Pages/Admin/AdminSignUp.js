import React, { useState } from 'react';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import '../../styles/Admin/AdminSignUp.css';
import { Link } from 'react-router-dom';

const AdminSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log form data to console
      console.log('🔐 ADMIN SIGNUP SUBMITTED:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: '***HIDDEN***',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: ''
        });
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: 'Failed to create account. Please try again.' });
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
              <h1>Admin Registration</h1>
              <p>Create your administrator account</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <CheckCircleOutlined className="success-icon" />
            <div>
              <h3>Account Created Successfully!</h3>
              <p>Check console for form data</p>
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
          <div className="name-fields">
            <div className="form-group">
              <label htmlFor="firstName">
                <UserOutlined />
                <span>First Name</span>
                {errors.firstName && <span className="error-indicator">!</span>}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.firstName ? 'error' : ''}
                disabled={loading}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                <UserOutlined />
                <span>Last Name</span>
                {errors.lastName && <span className="error-indicator">!</span>}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.lastName ? 'error' : ''}
                disabled={loading}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

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
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <LockOutlined />
              <span>Password</span>
              {errors.password && <span className="error-indicator">!</span>}
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 8 characters)"
                className={errors.password ? 'error' : ''}
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
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-footer">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingOutlined spin />
                  Creating Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
            
            <div className="signin-link">
              Already have an account? <Link to="/AdminLogin">Sign In</Link>
            </div>
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default AdminSignUp;