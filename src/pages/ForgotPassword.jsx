import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/ForgotPasswordPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../schema/LoginSchema";
import { useForgotPassword } from "../hooks/useForgotPassword";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  // React Query mutation
  const forgotPasswordMutation = useForgotPassword();

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Clear API error when user starts typing
    if (apiError) {
      setApiError("");
    }

    // Real-time validation
    if (value.trim() === "") {
      setEmailError("Email is required");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    if (!email.trim() || !validateEmail(email)) {
      return;
    }

    setApiError("");

    try {
      const response = await forgotPasswordMutation.mutateAsync(
        email
      );
  console.log(response);
  if (response?.message) {
   // Success - show success screen
      setIsSuccess(true);
      
      // After showing success message, redirect to verify OTP page
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: email.trim() } });
      }, 2000);
  }
   

    } catch (error) {
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          "Something went wrong. Please try again.";
      setApiError(errorMessage);
    }
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
            We've sent a verification code to <strong>{email}</strong>. 
            Please check your email and enter the code to proceed.
          </motion.p>

          <motion.div
            className="success-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Redirecting you to verify your email...
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

        {apiError && (
          <motion.div
            className="api-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {apiError}
          </motion.div>
        )}

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
          No worries! Enter your email address and we'll send you a verification code to reset your password.
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
            disabled={forgotPasswordMutation.isPending || !email.trim() || emailError}
          >
            {forgotPasswordMutation.isPending ? <div className="spinner"></div> : "Send Verification Code"}
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