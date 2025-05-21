import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/ExpandableDescription.css';

const ExpandableDescription = ({ shortDescription, longDescription }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If there's no long description, just show the short one
  if (!longDescription) {
    return <p className="description-text">{shortDescription}</p>;
  }

  return (
    <div className="expandable-description">
      {/* Short description is always visible */}
      <p className="description-short">{shortDescription}</p>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="description-long"
          >
            <p>{longDescription}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button 
        className="toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isExpanded ? (
          <>
            <span>Show Less</span>
            <ChevronUp size={16} />
          </>
        ) : (
          <>
            <span>Read More</span>
            <ChevronDown size={16} />
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ExpandableDescription;