

/**
 * Validates full name
 * @param {string} name - The full name to validate
 * @returns {boolean} - Returns true if valid, false otherwise
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  
  // Check if name has at least 2 characters and contains only valid characters
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  
  return nameRegex.test(trimmedName) && trimmedName.length >= 2;
};

/**
 * Validates email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Returns true if valid, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email format validation
  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }
  
  // Additional checks
  return (
    trimmedEmail.length >= 5 &&
    trimmedEmail.length <= 254 &&
    !trimmedEmail.startsWith('.') &&
    !trimmedEmail.endsWith('.') &&
    !trimmedEmail.includes('..') &&
    !trimmedEmail.includes('@.')
  );
};

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {boolean} - Returns true if valid, false otherwise
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Password requirements:
  // - At least 8 characters long
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character
  
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

/**
 * Validates if passwords match
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} - Returns true if passwords match, false otherwise
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return false;
  }
  
  return password === confirmPassword;
};

/**
 * Validates the entire registration form
 * @param {Object} formData - Object containing all form fields
 * @param {string} formData.fullName - User's full name
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 * @param {string} formData.confirmPassword - Password confirmation
 * @returns {Object} - Returns validation result with errors
 */
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Validate full name
  if (!formData.fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (!validateName(formData.fullName)) {
    errors.fullName = "Please enter a valid full name (2-50 characters, letters only)";
  }
  
  // Validate email
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Validate password
  if (!formData.password?.trim()) {
    errors.password = "Password is required";
  } else if (!validatePassword(formData.password)) {
    errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
  }
  
  // Validate confirm password
  if (!formData.confirmPassword?.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = "Passwords do not match";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get password strength indicator
 * @param {string} password - The password to check
 * @returns {Object} - Returns strength level and feedback
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { level: 'none', feedback: 'Enter a password' };
  }
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('at least 8 characters');
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('one uppercase letter');
  
  // Lowercase check
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('one lowercase letter');
  
  // Number check
  if (/\d/.test(password)) score += 1;
  else feedback.push('one number');
  
  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('one special character');
  
  const levels = {
    0: { level: 'very-weak', text: 'Very Weak' },
    1: { level: 'weak', text: 'Weak' },
    2: { level: 'fair', text: 'Fair' },
    3: { level: 'good', text: 'Good' },
    4: { level: 'strong', text: 'Strong' },
    5: { level: 'very-strong', text: 'Very Strong' }
  };
  
  return {
    ...levels[score],
    score,
 
  };
};