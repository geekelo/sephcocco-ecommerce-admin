import React from 'react'
import { activities } from '../constants/data'
import ActivitiesCard from '../components/ActivitiesCard'

export default function ActivitiesPage() {
    const handleProductView = () => {
        console.log('click me');
        
    }
  return (
        <div className="activities-products-grid">
          {activities.map(item => (
            <ActivitiesCard
              key={item.id}
              activity={item}
              onView={handleProductView}
            />
          ))}
        </div>
  )
}
