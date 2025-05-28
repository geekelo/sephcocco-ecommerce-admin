import React from 'react';
import { Eye, Plus } from 'lucide-react';
import '../styles/ActivitiesCard.css';
import AddIcon from '../assets/add.svg'
export default function ActivitiesCard({ activity, onView }) {
  const { name, date, time } = activity;

  return (
    <div className="activities-card-container">
        <div className='activities-card-desc'>
           <div className="activities-card-icon">
       <img src={AddIcon} alt='add icon' className='add-icon'/>
      </div>
      <div className="activities-card-info">
     
        <h3 className="title" >{name}</h3>
        <div className='card-date'>
        <span className="date-label">{date}</span>
        <span>-</span>
        <span className="date-label">{time}</span>
        </div>

      </div>
        </div>
   

      <div className="activities-card-footer">
     <button 
            className="view-button"
            onClick={onView}
          >
            <span className="eye-icon">👁️</span> View
          </button>
      </div>
    </div>
  );
}


