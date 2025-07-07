import React from 'react';
import { Eye, Plus } from 'lucide-react';
import '../styles/ActivitiesCard.css';
import AddIcon from '../assets/add.svg';
import { formatDate } from '../utils/formatDate';
import { formatTime } from '../utils/formatTime';


export default function ActivitiesCard({ activity, onAdminClick }) {
  const handleAdminNameClick = (e) => {
    e.stopPropagation()
    onAdminClick(activity.sephcocco_user);
  };

  return (
    <div className="activities-card-container">
      <div className='activities-card-desc'>
        <div className="activities-card-icon">
          <img src={AddIcon} alt='add icon' className='add-icon'/>
        </div>
        <div className="activities-card-info">
          <h3 className="title">
            {activity?.activity_description} by{' '}
            <span 
              className="admin-name-clickable" 
              onClick={handleAdminNameClick}
              title="Click to view admin details"
            >
              {activity?.sephcocco_user.name}
            </span>
          </h3>
          <div className='card-date'>
            <span className="date-label">{formatDate(activity?.created_at)}</span>
            <span>-</span>
            <span className="time-label">{formatTime(activity?.created_at)}</span>
          </div>
        </div>
      </div>
      {/* Uncomment if you want to keep the view button
      <div className="activities-card-footer">
        <button
          className="view-button"
          onClick={onView}
        >
          <span className="eye-icon">👁️</span> View
        </button>
      </div> */}
    </div>
  );
}