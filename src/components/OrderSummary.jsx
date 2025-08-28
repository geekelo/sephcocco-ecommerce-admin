import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, X } from 'lucide-react';
import ProductCard from './ProductCard';
import OrderTable from './OrderTable';
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';
import EmailModal from './EmailModal';
import { formatDate } from '../utils/formatDate';
import FlexibleTable from './FlexibleTable';




const OrderSummary = ({ 
  order, 
  onBack, 
  onViewPayment, 
  onUpdateStatus, 
  onDiscard, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const {
    order_number,
    customerName,
    customerEmail, // Added customer email
    phoneNumber,
    orderDate,
    status,
    paymentMethod,
    paymentStatus,
    notes,
    product,
    payments
  } = order;
console.log('prod',order);

  // Prepare info card data with email
  const leftCardItems = [
    { label: "Order ID:", value: order.order_number,isCopyable: true },
    { label: "Customer Name:", value: order?.customer?.name  || 'Not provided'},
    {
      label: "Customer Email:",
      value: order?.customer?.email || "Not provided",
      isEmail: true
    },
    {
      label: "Phone Number:",
      value: order?.customer?.whatsapp_number || 'Not provided',
      isPhone: true
    },
    {
      label: "Address:",
      value: order?.customer?.address || 'Not provided'
    },
    { label: "Order Date:", value: formatDate(order?.created_at) || 'Not provided' }
  ];
  

  const rightCardItems = [
    { label: "Order Status:", value: order?.status,badge: true },
    { label: "Stages:", value: order?.stages, isStages: true },
    { label: "Payment Method:", value: paymentMethod || '--/--' },
    { label: "Payment Status:", value: paymentStatus || '--/--', badge: true },
    { label: "Order Notes:", value: order?.additional_notes || '--/--' }
  ];

  // Format payments for the order table
  const formattedPayments = payments?.map(payment => ({
    id: payment.id,
    customer: '', // Not showing customer in payment table
    amount: payment.amount,
    status: payment.status,
    date: payment.date,
    method: payment.method,
    action: 'View'
  }));

  // Define custom columns for the payment table
  const paymentColumns = [
    { id: 'id', label: 'Payment ID', className: 'payment-id' },
    { id: 'amount', label: 'Amount', className: 'amount' },
    { id: 'method', label: 'Method', className: 'method' },
    { id: 'status', label: 'Status', className: 'status' },
    { id: 'date', label: 'Date', className: 'date' },
    { id: 'action', label: 'Action', className: 'action' }
  ];

  const handleSendEmail = () => {
    if (customerEmail) {
      setIsEmailModalOpen(true);
    } else {
      alert('Customer email is not available for this order.');
    }
  };

  return (
    <>
      <div className="modal-overlay-order-summary">
        <div className="add-product-modal">
          <div className="modal-header">
            <h2>Order Summary</h2>
            <div className="header-actions">
              {/* Email button */}
              <button 
                className="email-button" 
                onClick={handleSendEmail}
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

          <div className="order-details">
            <div className="order-info-row">
              <InfoCard items={leftCardItems} />
              <InfoCard items={rightCardItems} />
            </div>

            <div className="ordered-products-section">
              <h3>Ordered Products</h3>
              <div className="ordered-products-grid">
               
                  <ProductCard
                   
                    product={order.product}
                    onView={onView}
                  
                  />
                
              </div>
            </div>

            <div className="linked-payment-section">
              <h3>Linked Payment</h3>
              <FlexibleTable
                orders={formattedPayments}
                columns={paymentColumns}
                keyField="id"
                onViewOrder={onViewPayment}
              />
            </div>

            <div className="form-actions">
              <button className="update-button add-button" onClick={onUpdateStatus}>
                Update Order Status
              </button>
              <button className="discard-button cancel-button" onClick={onDiscard}>
                Discard Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        customerName={customerName}
        customerEmail={customerEmail}
      />
    </>
  );
};

export default OrderSummary;