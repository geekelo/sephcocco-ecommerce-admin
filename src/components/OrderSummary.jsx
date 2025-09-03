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
console.log('dg',order);

  // const {
   
  //   customerName,
  //   customerEmail,

  //   paymentMethod,
  //   paymentStatus,

  //   payment_details // New payment_details field
  // } = order;

  console.log('order with payment details:', order);

  // Prepare info card data with email
  const leftCardItems = [
    { label: "Order ID:", value: order?.order_number, isCopyable: true },
    { label: "Customer Name:", value: order?.customer?.name || 'Not provided' },
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

  // Enhanced right card items with payment details integration
  const rightCardItems = [
    { label: "Order Status:", value: order?.status, badge: true },
    { label: "Stages:", value: order?.stages, isStages: true },
    { 
      label: "Payment Method:", 
      value: order?.payment_details?.payment_method  || '--/--' 
    },
    { 
      label: "Payment Status:", 
      value: order?.payment_details?.status  || '--/--', 
      badge: true 
    },
    { label: "Order Notes:", value: order?.additional_notes || '--/--' }
  ];

const formatPaymentData = () => {

if (order?.payment_details) {
    const paymentDetails = order.payment_details; // Properly declare the variable
      const formatAmount = (amount) => {
      if (!amount) return '0.00';
      const numericAmount = parseFloat(amount);
      return isNaN(numericAmount) ? '0.00' : numericAmount.toLocaleString();
    };
    const formatted = [{
      id: paymentDetails.id,
      amount: `₦${formatAmount(paymentDetails.amount)}`,
      status: paymentDetails.status,
      date: formatDate(paymentDetails.created_at),
      method: paymentDetails.payment_method,
      transaction_id: paymentDetails.transaction_id,
      action: 'View'
    }];

    
    return formatted;
  }
  
  console.log('No payment_details found');
  return [];
};

  const formattedPayments = formatPaymentData();


  // Enhanced payment columns to include transaction ID
  const paymentColumns = [
    { key: 'id', label: 'Payment ID', className: 'payment-id' },
    { key: 'transaction_id', label: 'Transaction ID', className: 'transaction-id' },
    { key: 'amount', label: 'Amount', className: 'amount' },
    { key: 'method', label: 'Method', className: 'method' },
    { key: 'status', label: 'Status', className: 'status' },
    { key: 'date', label: 'Date', className: 'date' },
    { key: 'action', label: 'Action', className: 'action' }
  ];

  const handleSendEmail = () => {
    const email = order?.customer?.email
    if (email) {
      setIsEmailModalOpen(true);
    } else {
      alert('Customer email is not available for this order.');
    }
  };

  // Helper function to get payment status badge class
  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
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
                disabled={!order?.customer?.email}
                title={!order?.customer?.email ? "Customer email not available" : "Send email to customer"}
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
                  product={order?.product}
                  onView={onView}
                />
              </div>
            </div>

            {/* Show payment table only if we have payment data */}
            {formattedPayments && formattedPayments.length > 0  && (
              <div className="linked-payment-section">
                <h3>Payment Details</h3>
                <FlexibleTable
                   data={formattedPayments}
                  columns={paymentColumns}
                  keyField="id"
                  onRowClick={onViewPayment} 
                />
              </div>
            )}

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
        customerName={order?.customer?.name}
        customerEmail={order?.customer?.email}
      />
    </>
  );
};

export default OrderSummary;