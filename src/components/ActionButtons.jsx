import React from 'react';
import '../styles/ActionButton.css';

const ActionButtons = ({ onDelete, onEdit}) => {
  const handleDelete= () => {
  
    onDelete();
  };
  const handleEdit = () => {
  
    onEdit();  
  };
  return (
    <div className="action-buttons">
      {onEdit &&  <button 
              className={` btn secondary `}
              onClick={handleEdit}
        
            >
       
             Edit product
            </button>}
          
      {onDelete &&<button className="btn primary" onClick={handleDelete}>Delete product</button>}

    </div>
  );
};

export default ActionButtons;