import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/LoginPage.css";
import storeImage from "../assets/login.png";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../schema/LoginSchema";
import { useLogin } from "../hooks/useLogin";
import Cookies from 'js-cookie'; 
import { useResendOtp } from "../hooks/useResendOtp";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
 const {
    mutateAsync: resendOtp,
    isPending: isResending,
  } = useResendOtp();
  const [showPassword, setShowPassword] = useState(false);
  const {mutateAsync: login} = useLogin()
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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Real-time validation
    if (value.trim() === "") {
      setPasswordError("Password is required");
    } else if (!validatePassword(value)) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError(""); // Clear previous API error

  // Final validation
  let isValid = true;

  if (!email.trim() || !validateEmail(email)) {
    setEmailError("Please enter a valid email address");
    isValid = false;
  }

  if (!password.trim() || !validatePassword(password)) {
    setPasswordError("Password must be at least 6 characters");
    isValid = false;
  }

  if (!isValid) return;

  setIsSubmitting(true);

  try {
    const payload = {
     user: { email, password}
    }

    
    const response = await login(payload);
 if (response?.user?.email_confirmed) {
        // User is verified, proceed with normal login
        if (response?.message) {
          
          localStorage.setItem('token', response?.token);
          localStorage.setItem('user', JSON.stringify(response?.user));
          localStorage.setItem('userRole', response?.user?.role);
          localStorage.setItem('userId', response?.user?.id);
          localStorage.setItem('subroles', JSON.stringify(response?.user?.subroles || []));
          
          localStorage.setItem('userName', response?.user?.name);
          Cookies.set('outlets', JSON.stringify(response?.user?.outlets), { expires: 1 }); 
          
          // Set activeOutlet to the first available outlet or a default value
          const outlets = response?.user?.outlets || [];
          if (outlets.length > 0) {
            Cookies.set('activeOutlet', outlets[0], { expires: 1 });
          } else {
            // Set a default outlet if none are available
            Cookies.set('activeOutlet', '', { expires: 1 });
          }
          
          console.log("Login success:", response);
          navigate("/store");
        }
      } else {
        // User needs email verification, send OTP and navigate to OTP page
        try {
          await resendOtp(email);
          navigate('/verify-email', { 
            state: { 
              email: email 
            } 
          });
        } catch (otpError) {
          console.error("Failed to send OTP:", otpError);
          setApiError("Failed to send verification code. Please try again.");
        }
      }
  } catch (error) {
    console.error("Login failed:", error);
    setApiError(error?.response?.data?.error || "Login failed. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
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
          Welcome Back!
        </motion.h1>

        <form onSubmit={handleSubmit} className="login-form">
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
              className={emailError ? "error email-input" : "email-input"}
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
                placeholder="Enter your password"
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
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

          <div className="forgot-password-container-login">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot your password?
            </Link>
          </div>
{apiError && <p className="error-message api-error">{apiError}</p>}

          <motion.button
            type="submit"
            className="sign-up-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <div className="spinner"></div> : "Sign In"}
          </motion.button>
        </form>

      
      </motion.div>
    </div>
  );
};

export default LoginPage;
