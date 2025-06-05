import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/LoginPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword, validateName, validatePasswordMatch, getPasswordStrength } from "../schema/RegisterSchema";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);

    // Real-time validation
    if (value.trim() === "") {
      setFullNameError("Full name is required");
    } else if (!validateName(value)) {
      setFullNameError("Please enter a valid full name (at least 2 characters)");
    } else {
      setFullNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation
    if (value.trim() === "") {
      setEmailError("Email is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Real-time password validation
    if (value.trim() === "") {
      setPasswordError("Password is required");
    } else if (!validatePassword(value)) {
      setPasswordError("Password must be at least 8 characters with uppercase, lowercase, number, and special character");
    } else {
      setPasswordError("");
    }
    
    // Also validate confirm password if it exists
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Real-time validation for password matching
    if (value.trim() === "") {
      setConfirmPasswordError("Please confirm your password");
    } else if (!validatePasswordMatch(password, value)) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation before submit
    let isValid = true;

    if (!fullName.trim() || !validateName(fullName)) {
      isValid = false;
    }

    if (!email.trim() || !validateEmail(email)) {
      isValid = false;
    }

    if (!password.trim() || !validatePassword(password)) {
      isValid = false;
    }

    if (!confirmPassword.trim() || !validatePasswordMatch(password, confirmPassword)) {
      isValid = false;
    }

    if (isValid) {
      // Set submitting state for animation
      setIsSubmitting(true);

      // Here you would typically make an API call to register the user
      // For now, we'll just navigate to the store
      setTimeout(() => {
        navigate("/sign-in");
      }, 1500); // Simulate API call delay
    }
  };

  // Get password strength for display
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="login-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={handleFullNameChange}
              className={fullNameError ? "error" : ""}
            />
            {fullNameError && <p className="error-message">{fullNameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              className={emailError ? "error" : ""}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a strong password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? "error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div 
                    className={`password-strength-fill ${passwordStrength.level}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="password-strength-text">
                  <span className={`strength-level ${passwordStrength.level}`}>
                    {passwordStrength.text}
                  </span>
                  <span className="strength-feedback">
                    {passwordStrength.feedback}
                  </span>
                </div>
              </div>
            )}
            
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={confirmPasswordError ? "error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
          </div>

          <motion.button
            type="submit"
            className="sign-up-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : "Create Account"}
          </motion.button>
        </form>

        <p className="sign-up-text">
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;