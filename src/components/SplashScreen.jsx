
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import '../styles/SplashScreen.css'
import Logo from '../assets/logo.png'
const SplashScreen = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

const rotationSpeed = 5
useEffect(() => {
  // Simulate loading time
  const timer = setTimeout(() => {
    setIsLoading(false);
    
    // Give time for exit animation to complete
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
  }, 4000); 
  
  return () => clearTimeout(timer);
}, [onComplete]);




  return (
    <div className="splash-container">
      <AnimatePresence>
      {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="splash-loading-container"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: rotationSpeed, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
              className="logo-container"
            >
            
              <img 
                src={Logo} 
                alt="Logo" 
                className="logo-image" 
              />
            </motion.div>
            
            <motion.div
              animate={{
                opacity: [0.4, 1, 0.4],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                }
              }}
              className="loading-text"
            >
              SEPHCOCCO
              <motion.span
                animate={{
                  opacity: [0, 1, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop"
                  }
                }}
              >...</motion.span>
            </motion.div>
          </motion.div>
        )}
       
      </AnimatePresence>
    
    </div>
  );
};

export { SplashScreen};