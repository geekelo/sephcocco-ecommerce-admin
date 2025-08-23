import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import InfoCard from './InfoCard';

import ProductCard from './ProductCard';

import { useViewProductId } from '../hooks/useGetProductById';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/OrderSummary.css';
import EditProductModal from './EditModal';
import ProductDetails from './ProductDetails';
import { useTrackOrder } from '../hooks/useTrackOrder';

const ShippingSummary = ({
  shipping,
  onBack
}) => {
  const [showMap, setShowMap] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  const activeOutlet = getActiveOutlet();

  const {
    tracking_number,
    status,
    datetime_delivered,
    dispatching,
    sephcocco_pharmacy_order,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    additional_notes,
    order_status,
    products,
    coordinates,
    total_amount,
    created_at,
    assigned_rider
  } = shipping;

  // Get tracking data for the assigned rider
  const { data: trackData, isLoading: isTrackingLoading, error: trackingError } = useTrackOrder(
    assigned_rider?.id
  );

  const leftCardItems = [
    { label: "Tracking Number:", value: tracking_number },
    { label: "Order ID:", value: sephcocco_pharmacy_order },
    { label: "Order Status:", value: order_status },
    { label: "Status:", value: status },
    { label: "Dispatching:", value: dispatching ? "Express" : "Standard" },
    { label: "Total Amount:", value: `₦${total_amount?.toLocaleString()}` }
  ];

  const rightCardItems = [
    { label: "Customer Name:", value: customer_name },
    {
      label: "Customer Email:",
      value: customer_email || "Not provided",
      isEmail: true
    },
    {
      label: "Phone Number:",
      value: customer_phone || "Not provided",
      isPhone: true
    },
    { label: "Address:", value: customer_address },
    { label: "Additional notes:", value: additional_notes },
    { 
      label: "Delivered:", 
      value: datetime_delivered ? new Date(datetime_delivered).toLocaleString() : 'Pending' 
    }
  ];

  const handleTrackOrder = () => {
    setShowMap(true);
  };

  const handleSendEmail = () => {
    if (customer_email) {
      // Here you would integrate with your email service
      alert(`Email functionality would be integrated here for ${customer_email}`);
    } else {
      alert('Customer email is not available for this shipment.');
    }
  };

  // Helper function to validate product ID
  const isValidProductId = (productId) => {
    return productId && productId.trim() !== '' && productId !== null && productId !== undefined;
  };

  const handleView = (productId) => {
    console.log('View requested for product ID:', productId);
    
    if (!isValidProductId(productId)) {
      console.error('Invalid product ID for view:', productId);
      return;
    }

    setSelectedProductId(productId);
    setIsViewModal(true);
  };

  const handleEdit = (productId) => {
    console.log('Edit requested for product ID:', productId);
    
    if (!isValidProductId(productId)) {
      console.error('Invalid product ID for edit:', productId);
      return;
    }

    setSelectedProductId(productId);
    setIsEditModal(true);
  };

  // Reset selected product when modals are closed
  const handleCloseModals = () => {
    setSelectedProductId('');
  };

  // Helper function to format coordinates
  const formatCoordinates = (coords) => {
    if (!coords) return 'Not available';
    
    // If coordinates is an object with lat and lng properties
    if (typeof coords === 'object' && coords.lat && coords.lng) {
      return `Latitude: ${coords.lat}, Longitude: ${coords.lng}`;
    }
    
    // If coordinates is an array [lat, lng]
    if (Array.isArray(coords) && coords.length === 2) {
      return `Latitude: ${coords[0]}, Longitude: ${coords[1]}`;
    }
    
    // If coordinates is a string (comma-separated or other format)
    if (typeof coords === 'string') {
      return `Coordinates: ${coords}`;
    }
    
    return 'Invalid coordinate format';
  };

  return (
    <div className="modal-overlay-order-summary">
      <div className="add-product-modal">
        {/* Main content - only show when no modals are open */}
        {!isViewModal && !isEditModal && (
          <>
            <div className="modal-header">
              <h2>Shipping Details</h2>
              <div className="header-actions">
                {/* Email button */}
                <button
                  className="email-button"
                  onClick={handleSendEmail}
                  disabled={!customer_email}
                  title={!customer_email ? "Customer email not available" : "Send email to customer"}
                >
                  <Mail size={16} />
                  Send Email
                </button>
                <button className="back-button" onClick={onBack}>
                  <ArrowLeft size={16} />
                  Go Back
                </button>
              </div>
            </div>
                            
            <div className="order-details">
              <div className="order-info-row">
                <InfoCard items={leftCardItems} />
                <InfoCard items={rightCardItems} />
              </div>

              {/* Tracking Section - Only show when dispatching is true */}
              {dispatching && (
                <div className="tracking-section">
                  <h3>Order Tracking</h3>
                  <div className="tracking-input-container">
                    {!showMap ? (
                      <div className="tracking-button-container">
                        <button
                          onClick={handleTrackOrder}
                          className="add-button tracking-button"
                          disabled={isTrackingLoading}
                        >
                          <MapPin size={16} />
                          {isTrackingLoading ? 'Loading tracking data...' : 'Show Location Details'}
                        </button>
                      </div>
                    ) : (
                      <div className="tracking-display">
                        {trackingError ? (
                          <div className="tracking-error">
                            <p>Unable to load tracking information at this time.</p>
                            <button
                              onClick={() => setShowMap(false)}
                              className="back-to-tracking-btn"
                            >
                              Back
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Display Location Information as Text */}
                            <div className="location-info">
                              <h4>Location Information</h4>
                              <div className="location-details">
                         
                                <div className="address-info">
                                  <p><strong>Delivery Address:</strong> {customer_address}</p>
                                </div>
                                <div className="customer-info">
                                  <p><strong>Customer:</strong> {customer_name}</p>
                                </div>
                               
                                {assigned_rider && (
                                  <div className="rider-info">
                                    <h5>Assigned Rider</h5>
                                    <p><strong>Name:</strong> {assigned_rider.name || 'Not specified'}</p>
                                    <p><strong>Phone:</strong> {assigned_rider.phone || 'Not specified'}</p>
                              
                                  </div>
                                )}
                                {trackData && trackData.locations && trackData.locations.length > 0 && (
                                  <div className="live-tracking-info">
                                    <h5>Current Rider Location</h5>
                                    <div style={{ 
                                      backgroundColor: '#f5f5f5', 
                                      padding: '15px', 
                                      borderRadius: '5px',
                                      fontSize: '14px'
                                    }}>
                                      <p><strong>Latitude:</strong> {trackData.locations[0].latitude}</p>
                                      <p><strong>Longitude:</strong> {trackData.locations[0].longitude}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setShowMap(false)}
                                className="add-button tracking-button"
                                style={{ marginTop: '15px' }}
                              >
                                Back to Tracking
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show message when dispatching is false */}
              {!dispatching && (
                <div className="no-tracking-section">
                  <h3>Tracking Status</h3>
                  <p className="no-tracking-message">
                    Order tracking will be available once the item is dispatched for delivery.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShippingSummary;