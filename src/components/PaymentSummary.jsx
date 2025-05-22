import React from 'react';
import { ArrowLeft } from 'lucide-react';
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
  onView 
}) => {
  const {
    id,
    customerName,
    phoneNumber,
    orderDate,
    status,
    paymentMethod,
    paymentStatus,
    notes,
    products,
    payments
  } = order;

  // Get the first payment for display (assuming we're showing one payment)
  const currentPayment = payments && payments.length > 0 ? payments[0] : null;

  // Convert products to the format expected by ProductCard
  const formattedProducts = products.map(product => ({
    name: product.name,
    image: product.image,
    price: product.price,
    rating: product.quantity, // Using quantity in place of rating
    stockCount: product.stockCount,
    stockStatus: "In stock"
  }));

  // Prepare info card data with correct payment information
  const leftCardItems = [
    { label: "Payment ID:", value: currentPayment?.id || "N/A" },
    { label: "Payment Method:", value: paymentMethod },
    { label: "Payment Date:", value: currentPayment?.date || orderDate },
    { label: "Total Amount:", value: currentPayment?.amount || "N/A" }
  ];

  const rightCardItems = [
    { label: "Customer Name:", value: customerName },
    { label: "Order ID:", value: id },
    { label: "Phone Number:", value: phoneNumber },
    { label: "Payment Status:", value: paymentStatus }
  ];

  return (
    <div className="modal-overlay">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Payment Summary ({currentPayment?.id || id})</h2>
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={16} />
            Go Back
          </button>
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