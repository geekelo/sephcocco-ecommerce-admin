import React, { useState, useMemo } from 'react';
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import { EmptyState } from "../components/EmptyState";
import ShippingSkeleton from "../components/ShippingSkeleton";
import Pagination from "../components/Pagination";
import ShippingSummary from "../components/ShippingSummary";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import "../styles/OrderPage.css";
import "../styles/Shipping.css"
import "../styles/RidersDropdown.css"
import "../styles/RidersStats.css"
import { RiderStatistics } from '../components/RidersStats';
import { RiderDropdown } from '../components/RidersDropdown';
import { ridersData } from '../utils/ridersData';
import { useShippings } from '../hooks/useShippings';
import { useGetAllUsers } from '../hooks/useGetAllUser';
import { useRiders } from '../hooks/useRiders';

const itemsPerPage = 10;

const ShippingPage = () => {
  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // State to track rider assignments for each order
  const [riderAssignments, setRiderAssignments] = useState({});

  const activeOutlet = getActiveOutlet();
  const { data, isLoading, error } = useShippings(activeOutlet,    currentPage, 
    itemsPerPage);


const {data: riders, isLoading: isLoadingRiders} = useRiders()


  // Transform API data to match component expectations
  const transformApiData = (apiData) => {
    if (!apiData?.shippings || !Array.isArray(apiData.shippings)) {
      return [];
    }

    return apiData.shippings.map((shipping) => {
      const order = shipping[`sephcocco_${activeOutlet}_order`] || {};
      
      return {
        id: shipping.id || '-',
        tracking_number: shipping.tracking_number || '-',
        status: shipping.status || 'pending',
        datetime_delivered: shipping.datetime_delivered || null,
        dispatching: shipping.dispatching ? 'Express' : 'Standard',
        sephcocco_pharmacy_order: order.order_number || '-',
        
        // Customer info - we'll need to get this from the order's customer data
        customer_name: shipping?.customer?.name, // This might need to come from a separate API call
        customer_phone: shipping?.customer?.phone_number || shipping?.customer?.whatsapp_number,
        customer_email: shipping?.customer?.email || '-',
        customer_address: shipping?.customer?.address || '-',
        
      
    
        
        // Financial info
        total_amount: parseFloat(order.total_price || '0'),
        
        // Dates
        created_at: shipping.created_at || order.created_at,
        updated_at: shipping.updated_at,
        
        // Additional fields
        outlet: activeOutlet,
        assigned_rider: shipping.rider || null,
        
        // Order details
        order_id: order.id,
        order_status: order.status,
        current_stage: order.current_stage,
        stages: order.stages || [],
        additional_notes: order.additional_notes || '-'
      };
    });
  };

  const shippingData = useMemo(() => {
    return transformApiData(data);
  }, [data]);



  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return shippingData.filter(item => {
      const matchesSearch = filters.search_terms === "" || 
        item.tracking_number.toLowerCase().includes(filters.search_terms.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(filters.search_terms.toLowerCase()) ||
        item.sephcocco_pharmacy_order.toLowerCase().includes(filters.search_terms.toLowerCase());
      
      const matchesStatus = filters.status === "" || filters.status === "All Status" || 
        item.status.toLowerCase() === filters.status.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [shippingData, filters]);

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  // Get meta data from API or calculate from filtered data
  const meta = {
    current_page: currentPage,
    total_pages: Math.ceil(filteredData.length / itemsPerPage),
    total_count: filteredData.length,
    per_page: itemsPerPage
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-completed';
      case 'in_transit': 
      case 'dispatched': return 'status-delivering';
      case 'processing': 
      case 'pending': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // Handle rider assignment
  // const handleRiderAssignment = (orderId, rider) => {
  //   setRiderAssignments(prev => ({
  //     ...prev,
  //     [orderId]: rider
  //   }));
    
  //   // Here you would typically make an API call to update the rider assignment
  //   console.log(`Assigned rider ${rider.name} to order ${orderId}`);
  // };

  // Get current rider for an order (from assignments or initial data)
  const getCurrentRider = (order) => {
    return  order.assigned_rider;
  };

  // Enhanced shipping table columns
  const shippingColumns = [
    {
      key: 'tracking_number',
      header: 'Tracking Number',
      accessorKey: 'tracking_number',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">
          {String(row.original.tracking_number || '-')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`status-badge ${getStatusColor(row.original.status)}`}>
          {String(row.original.status || '-').toUpperCase()}
        </span>
      )
    },
    {
      key: 'customer_info',
      header: 'Customer',
      accessorKey: 'customer_name',
      cell: ({ row }) => (
        <div className="customer-info">
          <div className="customer-name font-medium">
            {String(row.original.customer_name || '-')}
          </div>
          {row.original.customer_phone && row.original.customer_phone !== '-' && (
            <div className="customer-phone text-sm text-gray-500">
              {String(row.original.customer_phone)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'sephcocco_pharmacy_order',
      header: 'Order ID',
      accessorKey: 'sephcocco_pharmacy_order',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {String(row.original.sephcocco_pharmacy_order || '-')}
        </span>
      )
    },
    {
      key: 'total_amount',
      header: 'Amount',
      accessorKey: 'total_amount',
      cell: ({ row }) => {
        const amount = row.original.total_amount || 0;
        if (amount === 0) return '-';
        return `₦${Number(amount).toLocaleString()}`;
      }
    },
{
  key: 'assigned_rider',
  header: 'Assigned Rider',
  accessorKey: 'assigned_rider',
  cell: ({ row }) => {
    console.log("Row:", row);
    console.log("Row ID:", row.original.id);

    return (
      <RiderDropdown
        currentRider={getCurrentRider(row.original)}
        shippingId={row.original.id}
        ridersData={riders}
      />
    );
  }
},
    {
      key: 'datetime_delivered',
      header: 'Delivered Date',
      accessorKey: 'datetime_delivered',
      cell: ({ row }) => {
        if (row.original.datetime_delivered) {
          try {
            return new Date(row.original.datetime_delivered).toLocaleDateString();
          } catch (e) {
            return '-';
          }
        }
        return '-';
      }
    }
  ];

  const shippingActions = [
    {
      label: 'View',
      icon: null,
      onClick: (item) => handleViewDetails(item),
      className: 'view-action-btn',
      isText: true,
      render: () => <span className="view-action-btn">View</span>
    }
  ];

  const handleViewDetails = (shipping) => {
    setSelectedShipping(shipping);
    setShowDetailsModal(true);
  };

  const handleApplyFilters = ({ status, search_terms, start_date, end_date }) => {
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShippingSummaryBack = () => {
    setShowDetailsModal(false);
    setSelectedShipping(null);
  };

  // Handle loading state
  if (isLoading || isLoadingRiders) {
    return <ShippingSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="order-page">
        <div className="error-container p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Shipping Data</h3>
          <p className="text-gray-600 mb-4">{error.message || 'Something went wrong'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="add-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Shipping Management</h1>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Manage and track all shipping deliveries 
          </p>
        </div>
      </div>

      <SearchBar
        onApply={handleApplyFilters}
        filterOptions={["All Status", "pending", "processing", "dispatched", "delivered", "cancelled"]}
        placeholder="Search by tracking number, customer name, or order ID..."
        filterLabel="Filter by Status"
      />

      {/* Rider Statistics */}
      <RiderStatistics 
  
        shippingData={shippingData} 
        ridersData={riders}
      />

      <div className="order-table-container">
        {paginatedData?.length > 0 ? (
          <>
            <FlexibleTable
              data={paginatedData}
              columns={shippingColumns}
              actions={shippingActions}
              keyField="id"
              onRowClick={handleViewDetails}
              className="orders-table"
              emptyState={
                <EmptyState 
                  title="No shipping records found" 
                  searchTerm={filters.search_terms} 
                />
              }
            />

            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.total_pages}
              onPageChange={handlePageChange}
              totalItems={meta.total_count}
              itemsPerPage={meta.per_page}
              showInfo={true}
            />
          </>
        ) : (
          <EmptyState 
            title="No shipping records found" 
            searchTerm={filters.search_terms}
            description={filters.search_terms || filters.status ? 
              "No shipping records match your current search criteria." : 
              "No shipping records have been created yet."
            }
          />
        )}
      </div>

      {/* Shipping Summary Modal */}
      {showDetailsModal && selectedShipping && (
        <ShippingSummary
          shipping={selectedShipping}
          onBack={handleShippingSummaryBack}
        />
      )}
    </div>
  );
};

export default ShippingPage;