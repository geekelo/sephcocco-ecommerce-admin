import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import ProductCard from './ProductCard';
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';

const PaymentSummary = ({
  order,
  onBack,
  onViewOrder,
  onVerify,
  onDiscard,
  isVerifying = false, // Specific loading state for verify action
  onEdit,
  onDelete,
  onView,
  onSendEmail
}) => {
  // For payment page, 'order' is actually a payment object with additional order info
  const {
    transactionId: paymentId,
    amount,
    paymentMethod,
    status: paymentStatus,
    paymentDate,
    customerName,
    customerEmail,
    orderId,
    phoneNumber,
    orderDate,
    orderStatus,
    notes,
    products
  } = order;

  // Convert single product object to array format expected by ProductCard
  // Since products is a single object, we need to wrap it in an array
  const formattedProducts = products ? [{
    name: products.name,
    image: products.main_image_url || '/default-product-image.jpg', // Use main_image_url from your data
    price: products.price,
    rating: 5, // You can set a default or get from somewhere else
    stockCount: products.amount_in_stock,
    stockStatus: products.out_of_stock_status ? "Out of stock" : "In stock",
    description: products.short_description,
    categories: products.categories?.map(cat => cat.name).join(', ') || 'No category'
  }] : [];

  const leftCardItems = [
    { label: "Payment ID:", value: paymentId },
    { label: "Payment Method:", value: paymentMethod || "Not specified" },
    { label: "Payment Date:", value: new Date(paymentDate).toLocaleDateString() },
    { label: "Total Amount:", value: `₦${amount}` }
  ];

  const rightCardItems = [
    { label: "Customer Name:", value: customerName },
    {
      label: "Customer Email:",
      value: customerEmail || "Not provided",
      isEmail: true
    },
    {
      label: "Phone Number:",
      value: phoneNumber || "Not provided",
      isPhone: true
    },
    { label: "Order ID:", value: orderId },
    { label: "Payment Status:", value: paymentStatus },
    { label: "Order Status:", value: orderStatus }
  ];

  return (
    <div className="modal-overlay-order-summary">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Payment Summary ({paymentId})</h2>
          <div className="header-actions">
            {/* Email button */}
            <button
              className="email-button"
              onClick={onSendEmail}
              disabled={!customerEmail}
              title={!customerEmail ? "Customer email not available" : "Send email to customer"}
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
                        
        <div className='verify'>
          <button 
            className="update-button add-button" 
            onClick={onVerify}
            disabled={isVerifying}
            style={{ 
              opacity: isVerifying ? 0.6 : 1,
              cursor: isVerifying ? 'not-allowed' : 'pointer'
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Payment'}  
          </button>
        </div>
                        
        <div className="order-details">
          <div className="order-info-row">
            <InfoCard items={leftCardItems} />
            <InfoCard items={rightCardItems} />
          </div>

          {formattedProducts.length > 0 && (
            <div className="ordered-products-section">
              <h3>Ordered Product</h3>
              <div className="products-grid">
                {formattedProducts.map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="update-button add-button" onClick={onViewOrder}>
             View Order
            </button>
            <button 
              className="discard-button cancel-button" 
              onClick={onDiscard}
              disabled={isVerifying}
            >
              Discard Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;