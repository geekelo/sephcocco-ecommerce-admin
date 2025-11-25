import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import "../styles/UnauthorizedPage.css";
import storeImage from "../assets/login.png";

const UnauthorizedPage = () => {
  const navigate = useNavigate();



  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="unauthorized-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />

      <motion.div
        className="unauthorized-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
   

        <motion.div
          className="error-icon-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Lock size={60} strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          className="error-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Access Denied
        </motion.h1>

        <motion.p
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          You don't have permission to access this page. Your current role doesn't grant you access to this resource.
        </motion.p>



        <motion.div
          className="unauthorized-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
   

          <motion.button
            className="action-button back-button"
            onClick={handleGoBack}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </motion.button>
        </motion.div>

        <motion.div
          className="error-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p>If you believe you should have access to this page, please contact your administrator.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;