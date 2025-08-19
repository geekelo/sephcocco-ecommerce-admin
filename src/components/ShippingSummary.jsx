import React, { useState } from 'react';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';
import InfoCard from './InfoCard';
import GoogleMapTracker from './GoogleMapTracker';
import ProductCard from './ProductCard';

import { useViewProductId } from '../hooks/useGetProductById';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/OrderSummary.css';
import EditProductModal from './EditModal';
import ProductDetails from './ProductDetails';

const ShippingSummary = ({
  shipping,
  onBack
}) => {
  const [trackingInput, setTrackingInput] = useState('');
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
    products,
    coordinates,
    total_amount,
    created_at
  } = shipping;

  // Fetch product details when a product is selected for view/edit
  const { data: selectedProduct } = useViewProductId(
    activeOutlet,
    selectedProductId, 
    { 
      enabled: !!selectedProductId && selectedProductId.trim() !== ''
    }
  );

  const leftCardItems = [
    { label: "Tracking Number:", value: tracking_number },
    { label: "Order ID:", value: sephcocco_pharmacy_order },
    { label: "Status:", value: status },
    { label: "Dispatching:", value: dispatching },
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
    { 
      label: "Delivered:", 
      value: datetime_delivered ? new Date(datetime_delivered).toLocaleString() : 'Pending' 
    }
  ];

  const handleTrackingSubmit = () => {
    if (!trackingInput.trim()) return;
    
    if (trackingInput.toLowerCase() === tracking_number.toLowerCase()) {
      setShowMap(true);
      setTrackingInput('');
    } else {
      alert('Tracking number does not match this shipment');
    }
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

  return (
    <div className="modal-overlay-order-summary">
      <div className="add-product-modal">
        {/* Product View Modal */}
        {isViewModal && selectedProduct && isValidProductId(selectedProductId) && (
          <ProductDetails
            product={selectedProduct}
            onEdit={() => {
              setIsViewModal(false);
              handleEdit(selectedProduct.id);
            }}
            onDelete={null} // Don't allow deletion from shipping view
            onClose={() => {
              setIsViewModal(false);
              handleCloseModals();
            }}
          />
        )}



        {/* Main content - only show when no modals are open */}
        {!isViewModal && !isEditModal && (
          <>
            <div className="modal-header">
              <h2>Shipping Details ({tracking_number})</h2>
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

              {/* Shipped Products Section */}
              {products && products.length > 0 && (
                <div className="ordered-products-section">
                  <h3>Shipped Products ({products.length} item{products.length !== 1 ? 's' : ''})</h3>
                  <div className="shipped-products-grid">
                    {products.map((product, index) => (
                      <div key={index} className="shipped-product-item">
                        <ProductCard
                          product={{
                            id: product.id || `shipped-${index}`, // Use actual product ID if available
                            order_number: product.id || `shipped-${index}`,
                            name: product.name || 'N/A',
                            main_image_url: product.image || product.main_image_url || '/image.png',
                            price: (product.price || 0).toLocaleString(),
                            likes: product.likes || 0,
                            amount_in_stock: product.quantity || 0,
                            out_of_stock_status: product.out_of_stock_status || false,
                            visible: product.visible !== undefined ? product.visible : true
                          }}
                          onEdit={null}
                          onView={() => handleView(product.id)}
                          onDelete={null} // Don't allow deletion of shipped products
                          onVisibilityChange={null} // Don't allow visibility changes for shipped products
                        />
                      
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tracking Input Section */}
              <div className="tracking-section">
                <h3>Track Location</h3>
                <div className="tracking-input-container">
                  {!showMap ? (
                    <div className="tracking-input-group">
                      <input
                        type="text"
                        placeholder="Enter tracking number to view location"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTrackingSubmit()}
                        className="tracking-input"
                      />
                      <button
                        onClick={handleTrackingSubmit}
                        className="add-button tracking-button"
                        disabled={!trackingInput.trim()}
                      >
                        <MapPin size={16} />
                        Track
                      </button>
                    </div>
                  ) : (
                    <GoogleMapTracker 
                      coordinates={coordinates}
                      address={customer_address}
                      customerName={customer_name}
                      trackingNumber={tracking_number}
                      status={status}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShippingSummary;