import React, { useState } from 'react';
import { useViewActivities } from '../hooks/useGetActivities';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import ActivitiesCard from '../components/ActivitiesCard';
import AdminModal from '../components/AdminModal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination'; 
import LoadingSkeleton from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import '../styles/SearchBar.css';

const itemsPerPage = 10;

export default function ActivitiesPage() {
  const active_outlet = getActiveOutlet();

  // Filters
  const [filters, setFilters] = useState({
    search_terms: '',
    activity_type: '',
    start_date: '',
    end_date: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Query
  const { data: activitiesData, isLoading } = useViewActivities(
    active_outlet,
    filters,
    currentPage,
    itemsPerPage
  );

  const activities = activitiesData?.admin_activities || [];
  const meta = activitiesData?.meta || {};

  // Handle admin card click
  const handleAdminClick = (adminData) => {
    setSelectedAdmin(adminData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAdmin(null);
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      search_terms: value,
    }));
    setCurrentPage(1);
  };

  const handleApplyFilters = ({ activity_type, start_date, search_terms, end_date }) => {
    setFilters((prev) => ({
      ...prev,
      activity_type,
      search_terms,
      start_date,
      end_date,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Always sort by created_at DESC (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <>
      <SearchBar
        onSearch={handleSearchChange}
        onApply={handleApplyFilters}
        searchTerm={searchTerm}
        filterOptions={['Create', 'Update', 'Delete']}
        filterKey="activity_type"
      />

      <div className="activities-products-grid mt-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div className="product-grid-item" key={`skeleton-${idx}`}>
              <LoadingSkeleton />
            </div>
          ))
        ) : sortedActivities.length === 0 ? (
          <EmptyState message="No activities found" />
        ) : (
          sortedActivities.map((item) => (
            <ActivitiesCard
              key={item.id}
              activity={item}
              onView={() => console.log('View product')}
              onAdminClick={handleAdminClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          name="Activities"
          itemsPerPage={itemsPerPage}
          currentPage={meta.current_page || 1}
          totalPages={meta.total_pages || 1}
          onPageChange={handlePageChange}
          totalItems={meta.total_count || 0}
          showInfo={true}
        />
      </div>

      {/* Admin Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        adminData={selectedAdmin}
      />
    </>
  );
}
