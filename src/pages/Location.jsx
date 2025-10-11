import React, { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import Pagination from "../components/Pagination";
import LocationModal from "../components/LocationModal";
import ConfirmActionModal from "../components/ConfirmActionModal";
import { Edit3, Plus, Trash } from 'lucide-react';
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import "../styles/AdminLocationPage.css";

// Location table columns configuration
const locationColumns = [
  {
    key: 'state',
    label: 'State',
    sortable: true,
    render: (value, row) => {
      const stateValue = typeof value === 'object' && value !== null ? value.state : value;
      return <span style={{ fontWeight: '600' }}>{stateValue || 'N/A'}</span>;
    }
  },
  {
    key: 'price',
    label: 'Delivery Price',
    sortable: true,
    render: (value, row) => {
      const priceValue = typeof value === 'object' && value !== null ? value.price : value;
      const numericPrice = parseFloat(priceValue) || 0;
      
      return (
        <span style={{ color: '#F93A01', fontWeight: '600' }}>
          ₦{numericPrice.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </span>
      );
    }
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value, row) => {
      const statusValue = typeof value === 'object' && value !== null ? value.status : value;
      const statusLower = statusValue ? String(statusValue).toLowerCase() : 'active';
      const displayValue = statusValue ? String(statusValue) : 'Active';
      return (
        <span className={`status-badge ${statusLower}`}>
          {displayValue}
        </span>
      );
    }
  },
  {
    key: 'created_at',
    label: 'Date Added',
    sortable: true,
    render: (value, row) => {
      const dateValue = typeof value === 'object' && value !== null ? value.created_at : value;
      if (!dateValue) return 'N/A';
      
      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  },
    {
      key: 'actions',
      label: 'Actions',
      flex: 0,
      minWidth: '60px',
      type: 'actions',
      className: 'actions-column'
    }
];

// Location actions configuration
const locationActions = [
  {
    label: 'Edit',
    value: 'edit',
    icon: <Edit3 size={14} />
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: <Trash size={14} />,
    className: 'delete-action'
  }
];

const AdminLocationPage = () => {
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status",
    startDate: "",
    endDate: ""
  });

  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddLocationModal, setIsAddLocationModal] = useState(false);
  const [isEditLocationModal, setIsEditLocationModal] = useState(false);
  const [isDeleteLocationModal, setIsDeleteLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const active_outlet = getActiveOutlet();
  const queryClient = useQueryClient();

  // Mock data - Replace with your actual API hooks
  const mockLocations = [
    { id: 1, state: 'Lagos', price: 2500, status: 'Active', created_at: '2024-01-15T10:30:00Z' },
    { id: 2, state: 'Abuja', price: 3000, status: 'Active', created_at: '2024-01-16T11:20:00Z' },
    { id: 3, state: 'Port Harcourt', price: 3500, status: 'Active', created_at: '2024-01-17T09:15:00Z' },
    { id: 4, state: 'Kano', price: 4000, status: 'Inactive', created_at: '2024-01-18T14:45:00Z' },
  ];

  // Replace these with your actual hooks
  const locations = mockLocations;
  const isFetchingLocations = false;
  const fetchError = null;
  const refetchLocations = () => console.log('Refetching locations...');

  // Handle filter application
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes,
    sort_by_stock  
  }) => {
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
    
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      status: "", 
      search_terms: searchTerm,
      start_date: "", 
      end_date: "",
      sort_by_likes: "",
      sort_by_stock: ""
    });
  };

  // Sort and filter locations
  const { paginatedLocations, totalCount, totalPages } = useMemo(() => {
    let filtered = locations.filter(location => {
      const state = location.state || "";
      const price = location.price?.toString() || "";
      const searchLower = filters.search_terms.toLowerCase();
      
      if (!searchLower) return true;
      
      return state.toLowerCase().includes(searchLower) ||
             price.includes(searchLower);
    });

    // Sort by most recent first
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at).getTime();
      const dateB = new Date(b.created_at || b.updated_at).getTime();
      return dateB - dateA;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLocations = filtered.slice(startIndex, endIndex);

    return { paginatedLocations, totalCount, totalPages };
  }, [locations, filters.search_terms, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddLocation = () => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }
    setSelectedLocation(null);
    setIsAddLocationModal(true);
  };

  const handleRowClick = (location) => {
    setSelectedLocation(location);
    setIsEditLocationModal(true);
  };

  const handleActionClick = (action, location) => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }

    setSelectedLocation(location);
    
    switch (action) {
      case 'edit':
        setIsEditLocationModal(true);
        break;
      case 'delete':
        setIsDeleteLocationModal(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmDeleteLocation = async () => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }

    try {
      // Replace with your actual delete mutation
      // await deleteLocationMutation.mutateAsync({ 
      //   active_outlet, 
      //   locationId: selectedLocation.id 
      // });
      
      console.log('Deleting location:', selectedLocation);
      
      toast.success("Location deleted successfully!");
      setIsDeleteLocationModal(false);
      setSelectedLocation(null);

      if (paginatedLocations.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location. Please try again.");
    }
  };

  const handleLocationSubmit = async (locationData) => {
    if (!active_outlet) {
      toast.error("Please select an outlet first.");
      return;
    }

    try {
      if (selectedLocation) {
        // Replace with your actual update mutation
        console.log('Updating location:', locationData);
        toast.success("Location updated successfully!");
        setIsEditLocationModal(false);
      } else {
        // Replace with your actual add mutation
        console.log('Adding location:', locationData);
        toast.success("Location added successfully!");
        setIsAddLocationModal(false);
      }
      
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error(`Failed to ${selectedLocation ? 'update' : 'add'} location. Please try again.`);
    }
  };

  const isLoading = false; // Replace with actual loading states

  return (
    <div className="admin-location-page">
      <div className="page-header">
        <h1>Delivery Locations</h1>
        <div className="header-actions">
          <button 
            className="add-location-btn"
            onClick={handleAddLocation}
            disabled={isLoading}
          >
            <Plus size={16} />
            Add Location
          </button>
        </div>
      </div>

      <SearchBar
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch}
        filterOptions={[]}
        categoryOptions={[]}
        sortOptions={[]}
        placeholder="Search by state or price..."
        filterLabel="Filter by"
        showDate={false}
        initialValues={searchBarState}
      />

      <div className="location-table-container">
        <div className="page-title-section" style={{ marginBottom: '16px' }}>
          <h2>
            {totalCount} Location{totalCount !== 1 ? 's' : ''} found
          </h2>
          {filters.search_terms && (
            <p className="search-results-info">
              Showing results for "{filters.search_terms}"
            </p>
          )}
        </div>

        {fetchError ? (
          <ErrorState  
            title="Failed to load locations" 
            message="There was an error loading the locations. Please try again." 
            refetchLocations={refetchLocations} 
            isFetchingLocations={isFetchingLocations}
          />
        ) : (
          <FlexibleTable
            data={paginatedLocations}
            columns={locationColumns}
            actions={locationActions}
            keyField="id"
            onRowClick={handleRowClick}
            onActionClick={handleActionClick}
            className="locations-table"
            isLoading={isFetchingLocations}
            emptyState={
              <EmptyState 
                title={filters.search_terms ? `No locations found matching "${filters.search_terms}"` : "No locations found"} 
                btnText={filters.search_terms ? "Clear Search" : "Add Your First Location"} 
                handleAddCategory={filters.search_terms ? 
                  () => handleApplyFilters({ status: '', search_terms: '', start_date: '', end_date: '', sort_by_likes: '', sort_by_stock: '' }) : 
                  handleAddLocation
                } 
                isLoading={isLoading} 
                searchTerm={filters.search_terms}
              />
            }
          />
        )}

        {!isFetchingLocations && paginatedLocations.length > 0 && totalPages > 1 && (
          <Pagination
            name="Locations"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            showInfo={true}
          />
        )}
      </div>

      {isAddLocationModal && (
        <LocationModal
          isOpen={isAddLocationModal}
          onClose={() => {
            setIsAddLocationModal(false);
            setSelectedLocation(null);
          }}
          onSubmit={handleLocationSubmit}
          location={null}
          title="Add New Location"
          isLoading={isLoading}
        />
      )}

      {isEditLocationModal && (
        <LocationModal
          isOpen={isEditLocationModal}
          onClose={() => {
            setIsEditLocationModal(false);
            setSelectedLocation(null);
          }}
          onSubmit={handleLocationSubmit}
          location={selectedLocation}
          title="Edit Location"
          isLoading={isLoading}
        />
      )}

      {isDeleteLocationModal && (
        <ConfirmActionModal
          isOpen={isDeleteLocationModal}
          onClose={() => {
            setIsDeleteLocationModal(false);
            setSelectedLocation(null);
          }}
          onConfirm={handleConfirmDeleteLocation}
          type="delete"
          title="Confirm Delete Location"
          isLoading={isLoading}
          message={
            <>
              Are you sure you want to delete the location{" "}
              <strong>{selectedLocation?.state}</strong>?
              <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                This action cannot be undone.
              </div>
            </>
          }
        />
      )}
    </div>
  );
};

export default AdminLocationPage;