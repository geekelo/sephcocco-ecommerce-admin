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
  onEdit,
  onDelete,
  onView,
  onSendEmail // Added email handler prop
}) => {
  // For payment page, 'order' is actually a payment object with additional order info
  const {
    id: paymentId,
    amount,
    method,
    status: paymentStatus,
    date: paymentDate,
    customerName,
    customerEmail, // Added customer email
    orderId,
    phoneNumber,
    orderDate,
    orderStatus,
    paymentMethod,
    notes,
    products
  } = order;

  // Convert products to the format expected by ProductCard
  const formattedProducts = products?.map(product => ({
    name: product.name,
    image: product.image,
    price: product.price,
    rating: product.quantity,
    stockCount: product.stockCount,
    stockStatus: "In stock"
  })) || [];

  const leftCardItems = [
    { label: "Payment ID:", value: paymentId },
    { label: "Payment Method:", value: method || paymentMethod },
    { label: "Payment Date:", value: paymentDate },
    { label: "Total Amount:", value: amount }
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
    { label: "Payment Status:", value: paymentStatus }
  ];

  return (
    <div className="modal-overlay">
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
          <button className="update-button add-button" onClick={onVerify}>
            Verify Payment
          </button>
        </div>
                
        <div className="order-details">
          <div className="order-info-row">
            <InfoCard items={leftCardItems} />
            <InfoCard items={rightCardItems} />
          </div>

          {formattedProducts.length > 0 && (
            <div className="ordered-products-section">
              <h3>Ordered Products</h3>
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
            <button className="discard-button cancel-button" onClick={onDiscard}>
              Discard Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;