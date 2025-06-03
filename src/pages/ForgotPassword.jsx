import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/ForgotPasswordPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../schema/LoginSchema";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation
    if (!email.trim() || !validateEmail(email)) {
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // After showing success message, redirect to reset password
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate("/sign-in");
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-container">
        <div className="background-overlay"></div>
        <img src={storeImage} alt="Store" className="background-image" />

        <motion.div
          className="forgot-password-card success-card"
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
            Email Sent!
          </motion.h1>

          <motion.p
            className="success-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            We've sent password reset instructions to <strong>{email}</strong>. 
            Please check your email and follow the link to reset your password.
          </motion.p>

          <motion.div
            className="success-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Redirecting you to reset your password...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />

      <motion.div
        className="forgot-password-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <motion.h1
          className="forgot-password-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Forgot Password?
        </motion.h1>

        <motion.p
          className="forgot-password-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          No worries! Enter your email address and we'll send you a link to reset your password.
        </motion.p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
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

          <motion.button
            type="submit"
            className="reset-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || !email.trim() || emailError}
          >
            {isSubmitting ? <div className="spinner"></div> : "Send Reset Link"}
          </motion.button>
        </form>

        <motion.button
          onClick={handleBackToLogin}
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

export default ForgotPasswordPage;