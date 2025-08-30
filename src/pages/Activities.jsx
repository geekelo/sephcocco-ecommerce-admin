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
import '../styles/OrderPage.css'
const itemsPerPage = 10;

export default function ActivitiesPage() {
  const active_outlet = getActiveOutlet();

  // Add searchBarState for consistent UI state management
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status", 
    startDate: "",
    endDate: ""
  });

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
const { data: activitiesData, isLoading, refetch } = useViewActivities(
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

  // Updated to handle the new sort parameters from SearchBar
  const handleApplyFilters = ({ 
    activity_type, 
    start_date, 
    search_terms, 
    end_date, 
    status, // Accept status parameter (might be passed by SearchBar)
    sort_by_likes, // Accept but ignore sort parameters for activities
    sort_by_stock  // Accept but ignore sort parameters for activities
  }) => {
    // Only use the parameters that activities need
    setFilters((prev) => ({
      ...prev,
      activity_type,
      search_terms,
      start_date,
      end_date,
    }));
    setCurrentPage(1);
    
    // Update search bar state to maintain UI state
    setSearchBarState({
      search: search_terms || "",
      status: activity_type ? activity_type.charAt(0).toUpperCase() + activity_type.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  // Manual search handler - triggered when user types and presses Enter
  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      activity_type: "",
      search_terms: searchTerm,
      start_date: "",
      end_date: "",
      status: "", // Clear status filter
      sort_by_likes: "", // Clear sort filters
      sort_by_stock: ""  // Clear sort filters
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Always sort by created_at DESC (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="order-page">
      <SearchBar
        onSearch={handleSearchChange} // Keep existing onSearch for backward compatibility
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch} // Add manual search handler
        searchTerm={searchTerm}
        filterOptions={['All Status', 'Create', 'Update', 'Delete']} // Map activity types to filter options
        categoryOptions={[]} // Explicitly disable category filtering
        sortOptions={[]} // Explicitly disable sort options
        filterKey="activity_type"
        placeholder="Search activities..."
        filterLabel="Filter by Activity Type"
        showDate={true} // Enable date filtering for activities
        initialValues={searchBarState} // Pass persistent state
      />

      <div className="activities-products-grid mt-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div className="product-grid-item" key={`skeleton-${idx}`}>
              <LoadingSkeleton />
            </div>
          ))
        ) : sortedActivities.length === 0 ? (
          <EmptyState 
            message={filters.search_terms ? 
              `No activities found matching "${filters.search_terms}"` : 
              "No activities found"
            } 
            searchTerm={filters.search_terms}
          />
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
    </div>
  );
}