
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/LoginPage.css';
import storeImage from '../assets/login.png';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../schma/LoginSchema';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
const navigate = useNavigate()

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error message as user types
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error message as user types
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    if (isValid) {
      // Set submitting state for animation
      setIsSubmitting(true);
      
     navigate('/store')
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
          Welcome Back!!
        </motion.h1>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              type="text"
              id="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={handleEmailChange}
              className={emailError ? 'error' : ''}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              type="password"
              id="password"
              placeholder="Enter Password"
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? 'error' : ''}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          
          <motion.button
            type="submit"
            className="sign-up-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="spinner"></div>
            ) : (
              'Sign Up Now'
            )}
          </motion.button>
        </form>
        
        <p className="sign-up-text">
          Don't have an account? <a href="#signup">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;