  // Email validation function
 export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Password validation function
 export const validatePassword = (password) => {
    return password.length >= 6;
  };
