import React, { useState } from 'react';
import { activities } from '../constants/data';
import ActivitiesCard from '../components/ActivitiesCard';

import { useViewActivities } from '../hooks/useGetActivities';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import AdminModal from '../components/AdminModal';
import SearchBar from '../components/SearchBar';

export default function ActivitiesPage() {
  const active_outlet = getActiveOutlet();
  const { data: activitiesData } = useViewActivities(active_outlet);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  console.log('activities data:', activitiesData);
  
  const handleProductView = () => {
    console.log('click me');
  };

  const handleAdminClick = (adminData) => {
    console.log('Admin clicked:', adminData);
    setSelectedAdmin(adminData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  return (
    <>
    
      <div className="activities-products-grid">
      <SearchBar
        onSearch={handleSearchChange}
        onFilter={handleFilter}
        searchTerm={searchTerm}
        filterOptions={['Created','Updated','Deleted']}
      />
        {activitiesData?.admin_activities?.map(item => (
          <ActivitiesCard
            key={item.id}
            activity={item}
            onView={handleProductView}
            onAdminClick={handleAdminClick}
          />
        ))}
      </div>

      {/* Admin Details Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        adminData={selectedAdmin}
      />
    </>
  );
}