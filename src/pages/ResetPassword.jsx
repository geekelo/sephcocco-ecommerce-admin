import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/ResetPasswordPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { validatePassword, validatePasswordMatch, getPasswordStrength } from "../schema/RegisterSchema";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    // If no email is provided, redirect to forgot password
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

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

    // Final validation
    let isValid = true;

    if (!password.trim() || !validatePassword(password)) {
      isValid = false;
    }

    if (!confirmPassword.trim() || !validatePasswordMatch(password, confirmPassword)) {
      isValid = false;
    }

    if (isValid) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        
        // After showing success, redirect to login
        setTimeout(() => {
          navigate("/sign-in");
        }, 3000);
      }, 1500);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (isSuccess) {
    return (
      <div className="reset-password-container">
        <div className="background-overlay"></div>
        <img src={storeImage} alt="Store" className="background-image" />

        <motion.div
          className="reset-password-card success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
        

          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </motion.div>

          <motion.h1
            className="success-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Password Reset Successful!
          </motion.h1>

          <motion.p
            className="success-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your password has been successfully reset. You can now sign in with your new password.
          </motion.p>

          <motion.div
            className="success-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Redirecting you to sign in...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />

      <motion.div
        className="reset-password-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <motion.h1
          className="reset-password-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Reset Your Password
        </motion.h1>

        <motion.p
          className="reset-password-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Enter your new password for <strong>{email}</strong>
        </motion.p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
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
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div className="password-input-container">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your new password"
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
            className="reset-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || passwordError || confirmPasswordError || !password || !confirmPassword}
          >
            {isSubmitting ? <div className="spinner"></div> : "Reset Password"}
          </motion.button>
        </form>

        <motion.button
          onClick={() => navigate("/sign-in")}
          className="back-to-login"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Back to Sign In
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;