import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import storeImage from "../assets/login.png";
import '../styles/LoginPage.css';
import { useOtp } from "../hooks/useOtp";
import { useResendOtp } from "../hooks/useResendOtp";
import Cookies from 'js-cookie';

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [apiError, setApiError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = location.state?.email || "";

  // Use hooks for OTP operations
  const {
    mutateAsync: verifyOtp,
    isPending: isSubmitting,
  } = useOtp();

  const {
    mutateAsync: resendOtp,
    isPending: isResending,
  } = useResendOtp();

  // Redirect if no email provided
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    }
  }, [userEmail, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
    
    // Clear error when user starts typing
    if (apiError) setApiError("");
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < digits.length && i < 6; i++) {
          newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or last input
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setApiError("Please enter the complete 6-digit code");
      return;
    }
    
    // Validate that all characters are digits
    if (!/^\d{6}$/.test(otpString)) {
      setApiError("Please enter only numbers");
      return;
    }
    
    try {
      // Use the useOtp hook
      const response = await verifyOtp({ email: userEmail, token: otpString });

      console.log('OTP verification response:', response);
      
      if (response?.message) {
        // Save authentication data
        localStorage.setItem("token", response?.token);
        localStorage.setItem("userId", response?.user?.id);
        localStorage.setItem("userEmail", response?.user?.email);
        localStorage.setItem("pay-ref", response?.user?.payment_ref);
        localStorage.setItem('user', JSON.stringify(response?.user));
        localStorage.setItem('userRole', response?.user?.role);
        localStorage.setItem('userName', response?.user?.name);
        
        // Handle outlets if available
        if (response?.user?.outlets) {
          Cookies.set('outlets', JSON.stringify(response?.user?.outlets), { expires: 1 });
          
          const outlets = response?.user?.outlets || [];
          if (outlets.length > 0) {
            Cookies.set('activeOutlet', outlets[0], { expires: 1 });
          } else {
            Cookies.set('activeOutlet', '', { expires: 1 });
          }
        }
        
        // Navigate to store/dashboard
        navigate("/store");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      setApiError(error?.response?.data?.error || error?.message || "Invalid verification code. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    try {
      setApiError("");
      
      // Use the useResendOtp hook
      const response = await resendOtp(userEmail);
      
      console.log('Resend OTP response:', response);
      
      setResendCooldown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]); // Clear current OTP
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      console.error('Resend OTP failed:', error);
      setApiError(error?.response?.data?.error || error?.message || "Failed to resend code. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

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

        <motion.h1
          className="welcome-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Verify Email
        </motion.h1>

        <div className="otp-description" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '8px' }}>We've sent a 6-digit verification code to:</p>
          <strong style={{ color: '#333' }}>{userEmail}</strong>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter Verification Code</label>
            <div className="otp-input-container" style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              marginTop: '10px'
            }}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className="otp-input"
                  autoComplete="off"
                  disabled={isSubmitting}
                  whileFocus={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    width: '50px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                  }}
                />
              ))}
            </div>
          </div>

          {apiError && (
            <div className="error-message api-error" style={{ textAlign: 'center' }}>
              {apiError}
            </div>
          )}

          <motion.button
            type="submit"
            className="sign-up-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || otp.some(digit => !digit)}
            style={{ marginTop: '20px' }}
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </motion.button>

          <div className="resend-container" style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            color: '#666'
          }}>
            <span>Didn't receive the code? </span>
            <button
              type="button"
              className={`forgot-password-link ${resendCooldown > 0 || isResending ? 'disabled' : ''}`}
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || isResending}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 || isResending ? '#ccc' : '#007bff',
                textDecoration: 'underline',
                cursor: resendCooldown > 0 || isResending ? 'not-allowed' : 'pointer',
                fontSize: 'inherit'
              }}
            >
              {isResending 
                ? "Sending..." 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : "Resend Code"
              }
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button
              type="button"
              onClick={handleBackToLogin}
              className="forgot-password-link"
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default OTPPage;