import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import '../styles/StorePage.css';
import storeImage from '../assets/login.png';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
// Remove the hardcoded import
// import { storeOptions } from '../constants/data';
import { getStoreIcon } from '../utils/getStoreIcon';

const StoreSelectionPage = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get outlets from cookies
    const outletsFromCookies = Cookies.get('outlets');
    
    if (outletsFromCookies) {
      try {
        const parsedOutlets = JSON.parse(outletsFromCookies);
        setOutlets(parsedOutlets);
      } catch (error) {
        console.error('Error parsing outlets from cookies:', error);
        setOutlets([]);
      }
    } else {
      console.warn('No outlets found in cookies');
      setOutlets([]);
    }
    
    setLoading(false);
  }, []);

  const handleStoreSelection = (outlet) => {
    setSelectedStore(outlet);
    
  
    Cookies.set('activeOutlet', outlet, { expires: 1 });
    
    navigate('/');
  };

  if (loading) {
    return (
      <div className="store-container">
        <div className="background-overlay"></div>
        <img src={storeImage} alt="Store" className="background-image" />
        <motion.div
          className="store-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-container-store">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="loading-text">Loading outlets...</div>
        </motion.div>
      </div>
    );
  }

  if (outlets.length === 0) {
    return (
      <div className="store-container">
        <div className="background-overlay"></div>
        <img src={storeImage} alt="Store" className="background-image" />
        <motion.div
          className="store-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="logo-container-store">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <motion.h1
            className="selection-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            No outlets available
          </motion.h1>
          <p>Please contact administrator or try logging in again.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <div className="background-overlay"></div>
      <img src={storeImage} alt="Store" className="background-image" />
      
      <motion.div
        className="store-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-container-store">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        
        <motion.h1
          className="selection-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Select the store you want to manage
        </motion.h1>
        
        <div className="selection-options">
          {outlets.map((outlet, index) => (
            <motion.a
              key={outlet}
              href={`#${outlet}`}
              className={`store-option ${selectedStore === outlet.id ? 'selected' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1), duration: 0.4 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: '#f8f8f8',
                borderColor: '#F93A01'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                handleStoreSelection(outlet);
              }}
            >
              <div className="store-option-content">
                <div className="icon-container">
                  {/* Use a default icon or determine based on outlet type/name */}
                  {getStoreIcon(outlet)}
                </div>
                <span style={{textTransform: "capitalize"}}>{outlet}</span>
                <motion.div
                  className="arrow-container"
                  animate={selectedStore === outlet.id ? { x: 4 } : { x: 0 }}
                  whileHover={{ x: 2 }}
                >
                  <ArrowRight size={16} />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StoreSelectionPage;