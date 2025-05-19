import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, Utensils, Coffee, ArrowRight } from 'lucide-react';
import '../styles/StorePage.css';
import storeImage from '../assets/login.png';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import Icon1 from '../assets/restur.svg';
import Icon2 from '../assets/louge.svg';
import Icon3 from '../assets/phar.svg';
const StoreSelectionPage = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const navigate = useNavigate()
  const handleStoreSelection = (store) => {
    setSelectedStore(store);
    navigate('/products')

  };
  
  // Get the appropriate icon for each store type
  const getStoreIcon = (storeType) => {
    switch(storeType) {
      case 'pharmacy':
        return       <img 
                      src={Icon3}
                      alt="Icon" 
                      className="icon"
                    />;
      case 'restaurant':
        return       <img 
                      src={Icon1}
                      alt="Icon" 
                      className="icon"
                    />;
      case 'lounge':
        return       <img 
                      src={Icon2}
                      alt="Icon" 
                      className="icon"
                    />;
      default:
        return null;
    }
  };
  
  // Store options data
  const storeOptions = [
    { id: 'pharmacy', name: 'Go To Pharmacy', icon: 'pharmacy' },
    { id: 'restaurant', name: 'Go To Restaurant', icon: 'restaurant' },
    { id: 'lounge', name: 'Go To Lounge', icon: 'lounge' }
  ];

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
        <div className="logo-container">
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
          {storeOptions.map((store, index) => (
            <motion.a
              key={store.id}
              href={`#${store.id}`}
              className={`store-option ${selectedStore === store.id ? 'selected' : ''}`}
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
                handleStoreSelection(store.id);
              }}
            >
              <div className="store-option-content">
                <div className="icon-container">
                  {getStoreIcon(store.icon)}
                </div>
                <span>{store.name}</span>
                <motion.div 
                  className="arrow-container"
                  animate={selectedStore === store.id ? { x: 4 } : { x: 0 }}
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