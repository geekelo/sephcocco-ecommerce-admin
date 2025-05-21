import React, { useState } from 'react';
import { Heart, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/LikeButton.css';

const LikeButton = ({ initialLikes = 0, isLiked = false }) => {
 


  return (
    <div className="like-container">
         <Heart
          size={20}
          fill={isLiked ? '#e74c3c' : 'none'}
          color={isLiked ? '#e74c3c' : '#666'}
          strokeWidth={isLiked ? 2 : 1.5}
        />
        
 
      
      <div className="like-count-container">
        <motion.span 
          className="like-count"
          transition={{ duration: 0.4 }}
        >
          <ThumbsUp 
            size={14} 
            className={isLiked ? 'thumbs-up active' : 'thumbs-up'} 
          /> 
          {initialLikes}
        </motion.span>
        
   
      </div>
    </div>
  );
};

export default LikeButton;