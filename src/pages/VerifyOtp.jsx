import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/VerifyOTPPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useVerifyOTP } from "../hooks/useVerifyOTP";
import { useForgotPassword } from "../hooks/useForgotPassword";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [apiError, setApiError] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  
  // Get email from previous page state
  const email = location.state?.email || "";

  // React Query mutations
  const verifyOTPMutation = useVerifyOTP();
  const forgotPasswordMutation = useForgotPassword();

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (value, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Clear error states when user starts typing
    if (apiError || isInvalid) {
      setApiError("");
      setIsInvalid(false);
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      
      // Clear error states
      setApiError("");
      setIsInvalid(false);
      
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setApiError("Please enter a complete 6-digit OTP");
      setIsInvalid(true);
      return;
    }

    setApiError("");
    setIsInvalid(false);

      setIsSuccess(true);
      
      // Redirect after success to reset password with OTP
      setTimeout(() => {
        navigate("/reset-password", { 
          state: { 
            email,
            otp: otpValue 
          } 
        });
      }, 2000);try {
      const response = await verifyOTPMutation.mutateAsync({
        email,
        otp: otpValue
      });
console.log(response);
if (response?.message){

}
      // Success - show success screen
    
      
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          "Invalid OTP. Please check your code and try again.";
      
      setApiError(errorMessage);
      setIsInvalid(true);
      
      // Clear OTP inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setApiError("Email address is required to resend code");
      return;
    }

    setApiError("");
    setIsInvalid(false);
    setResendMessage("");

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: email.trim()
      });
if (response?.message) {
  // Success - show resend success message
      setResendMessage("Verification code has been resent to your email");
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setResendMessage("");
      }, 5000);

}
    
    } catch (error) {
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          "Failed to resend code. Please try again.";
      setApiError(errorMessage);
    }
  };

  const handleBackToForgotPassword = () => {
    navigate("/forgot-password");
  };

  if (isSuccess) {
    return (
      <div className="verify-otp-container">
        <div className="background-overlay"></div>
        <img src={storeImage} alt="Store" className="background-image" />

        <motion.div
          className="verify-otp-card success-card"
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
            Verification Successful!
          </motion.h1>

          <motion.p
            className="success-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your email has been verified successfully. You can now proceed to reset your password.
          </motion.p>

          <motion.div
            className="success-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Redirecting you to reset password...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="verify-otp-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />

      <motion.div
        className="verify-otp-card"
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

        {resendMessage && (
          <motion.div
            className="resend-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {resendMessage}
          </motion.div>
        )}

        <motion.h1
          className="verify-otp-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Verify Your Email
        </motion.h1>

        <motion.p
          className="verify-otp-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          We've sent a 6-digit verification code to <strong>{email}</strong>. 
          Enter the code below to verify your email address.
        </motion.p>

        <div className="otp-form">
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`otp-input ${isInvalid ? "error" : ""}`}
                whileFocus={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </div>

          <motion.button
            onClick={handleSubmit}
            className="verify-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={verifyOTPMutation.isPending || otp.join("").length !== 6}
          >
            {verifyOTPMutation.isPending ? <div className="spinner"></div> : "Verify Code"}
          </motion.button>
        </div>

        <div className="otp-actions">
          <motion.button
            onClick={handleResendCode}
            className="resend-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <div className="resend-spinner">
                <div className="spinner-small"></div>
                Sending...
              </div>
            ) : (
              "Didn't receive the code? Resend"
            )}
          </motion.button>

          <motion.button
            onClick={handleBackToForgotPassword}
            className="back-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ← Back to Forgot Password
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTPPage;