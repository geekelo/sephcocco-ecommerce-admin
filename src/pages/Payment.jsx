import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import OrderTable from "../components/OrderTable";
import "../styles/OrderPage.css";
import { initialOrders, mockCategories, mockProduct } from "../constants/data";
import EditProductModal from "../components/EditModal";
import ProductDetails from "../components/ProductDetails";
import PaymentSummary from "../components/PaymentSummary";
import ConfirmActionModal from "../components/ConfirmActionModal";
import UpdateOrderStatusModal from "../components/UpdateOrderStatusModal";
import { Mail, X } from 'lucide-react';

// Email Modal Component for Payment Page
const EmailModal = ({ isOpen, onClose, customerName, customerEmail }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSendEmail = () => {
    // Here you would typically integrate with your email service
    console.log('Sending email to:', customerEmail);
    console.log('Subject:', subject);
    console.log('Description:', description);
    
    // Reset form and close modal
    setSubject('');
    setDescription('');
    onClose();
    
    // Show success message (you could add a toast notification here)
    alert('Email sent successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirm">
      <div className="confirm-action-modal email-modal">
        <div className="modal-header-confirm">
          <h2>Send Email</h2>
          <button className="close-button-confirm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="email-modal-content">
          <div className="customer-info">
            <p><strong>To:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
          </div>
          
          <div className="email-form">
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="email-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter email message"
                rows="5"
                className="email-textarea"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              className="confirm-button"
              onClick={handleSendEmail}
              disabled={!subject.trim() || !description.trim()}
            >
              Send Email
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  // Table column configuration for payments
  const paymentColumns = [
    { id: "id", label: "Payment ID", className: "order-id" },
    { id: "amount", label: "Amount", className: "customer" },
    { id: "method", label: "Method", className: "customer" },
    { id: "status", label: "Status", className: "status" },
    { id: "date", label: "Date", className: "date" },
    { id: "action", label: "Action", className: "action" },
  ];

  // Extract payments from orders for the payment table
  const paymentData = initialOrders.flatMap(order => 
    order.payments.map(payment => ({
      ...payment,
      customerName: order.customerName,
      customerEmail: order.customerEmail, // Added customer email
      orderId: order.id,
      phoneNumber: order.phoneNumber,
      orderDate: order.orderDate,
      orderStatus: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      products: order.products
    }))
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditProductModal, setIsEditProductModal] = useState(false);
  const [isDeleteProductModal, setIsDeleteProductModal] = useState(false);
  const [isViewProductModal, setIsViewProductModal] = useState(false);
  const [isPaymentSummaryModal, setIsPaymentSummaryModal] = useState(false);
  const [isVerifyPaymentModal, setIsVerifyPaymentModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isUpdatePaymentStatusModal, setIsUpdatePaymentStatusModal] = useState(false);
  const [isDiscardPaymentModal, setIsDiscardPaymentModal] = useState(false);
  const [isEmailModal, setIsEmailModal] = useState(false); // Added email modal state
  
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  const handlePaymentSummaryBack = () => {
    setIsPaymentSummaryModal(false);
    setSelectedPayment(null);
  };

  const handleEditProduct = () => {
    setIsDeleteProductModal(false);
    setIsViewProductModal(false);
    setIsEditProductModal(true);
  };

  const handleDeleteProduct = () => {
    setIsEditProductModal(false);
    setIsViewProductModal(false);
    setIsDeleteProductModal(true);
  };

  const handleDiscardPayment = () => {
    setIsDiscardPaymentModal(true);
  };

  const handleConfirmDiscardPayment = () => {
    console.log("Discarding payment for:", selectedPayment?.id);
    setIsPaymentSummaryModal(false);
    setIsDiscardPaymentModal(false);
    setSelectedPayment(null);
  };

  const handleVerifyPayment = () => {
    console.log("Verifying payment for:", selectedPayment?.id);
    setIsVerifyPaymentModal(true);
  };

  const handleViewProduct = () => {
    setIsEditProductModal(false);
    setIsDeleteProductModal(false);
    setIsViewProductModal(true);
  };

  const handleConfirmDeleteProduct = () => {
    console.log("Deleting product:", mockProduct.name);
    setIsDeleteProductModal(false);
  };

  const handleVerifyConfirm = () => {
    console.log("Payment verified successfully");
    setIsVerifyPaymentModal(false);
    setIsSuccessModal(true);
  };

  const handleViewOrder = () => {
    console.log("Viewing order for payment:", selectedPayment?.id);
    // You can implement navigation to order details here
    setIsPaymentSummaryModal(false)
  };

  // Handler for viewing a payment (clicking View button in table)
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsPaymentSummaryModal(true);
  };

  // Handler for updating payment status
  const handleUpdatePaymentStatus = () => {
    setIsUpdatePaymentStatusModal(true);
  };

  const handleConfirmStatusUpdate = (newStatus) => {
    console.log("Updating payment status to:", newStatus, "for payment:", selectedPayment.id);
    // Update the payment status in your state/backend here
    setIsUpdatePaymentStatusModal(false);
  };

  // Handler for sending email
  const handleSendEmail = () => {
    if (selectedPayment?.customerEmail) {
      setIsEmailModal(true);
    } else {
      alert('Customer email is not available for this payment.');
    }
  };

  return (
    <div className="order-page">
      <SearchBar
        onSearch={handleSearchChange}
        onFilter={handleFilter}
        searchTerm={searchTerm}
      />
      <div className="order-table-container">
        <OrderTable
          orders={paymentData}
          columns={paymentColumns}
          keyField="id"
          onViewOrder={handleViewPayment}
        />
      </div>

      {/* Payment Summary Modal - Enhanced with Email Button */}
      {isPaymentSummaryModal && (
        <PaymentSummary
          order={selectedPayment}
          onBack={handlePaymentSummaryBack}
          onViewOrder={handleViewOrder}
          onVerify={handleVerifyPayment}
          onDiscard={handleDiscardPayment}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onView={handleViewProduct}
          onSendEmail={handleSendEmail} // Pass email handler
        />
      )}

      {/* Product Details Modal */}
      {isViewProductModal && (
        <ProductDetails
          product={mockProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onClose={() => setIsViewProductModal(false)}
        />
      )}

      {/* Edit Product Modal */}
      {isEditProductModal && (
        <EditProductModal
          isOpen={isEditProductModal}
          onClose={() => setIsEditProductModal(false)}
          product={mockProduct}
          categories={mockCategories}
        />
      )}

      {/* Update Payment Status Modal */}
      {isUpdatePaymentStatusModal && (
        <UpdateOrderStatusModal
          isOpen={isUpdatePaymentStatusModal}
          onClose={() => setIsUpdatePaymentStatusModal(false)}
          onConfirm={handleConfirmStatusUpdate}
          currentStatus={selectedPayment?.status}
        />
      )}

      {/* Email Modal */}
      {isEmailModal && (
        <EmailModal
          isOpen={isEmailModal}
          onClose={() => setIsEmailModal(false)}
          customerName={selectedPayment?.customerName}
          customerEmail={selectedPayment?.customerEmail}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {isDeleteProductModal && (
        <ConfirmActionModal
          isOpen={isDeleteProductModal}
          onClose={() => setIsDeleteProductModal(false)}
          onConfirm={handleConfirmDeleteProduct}
          type="delete"
          title="Confirm Delete"
          message={
            <>
              Are you sure you want to delete{" "}
              <strong>{mockProduct.name}</strong>?
            </>
          }
        />
      )}

      {/* Discard Payment Confirmation Modal */}
      {isDiscardPaymentModal && (
        <ConfirmActionModal
          isOpen={isDiscardPaymentModal}
          onClose={() => setIsDiscardPaymentModal(false)}
          onConfirm={handleConfirmDiscardPayment}
          type="discardPayment"
          title="Confirm Discard Payment"
          message={
            <>
              Are you sure you want to discard payment{" "}
              <strong>{selectedPayment?.id}</strong>? This action cannot be undone.
            </>
          }
        />
      )}

      {/* Verify Payment Confirmation Modal */}
      {isVerifyPaymentModal && (
        <ConfirmActionModal
          isOpen={isVerifyPaymentModal}
          onClose={() => setIsVerifyPaymentModal(false)}
          onConfirm={handleVerifyConfirm}
          type="verify"
          title="Confirm Verification"
          message={
            <>
              Are you sure you want to verify this payment made by{" "}
              <strong>{selectedPayment?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedPayment?.id}"</strong>?
            </>
          }
        />
      )}

      {/* Success Modal */}
      {isSuccessModal && (
        <ConfirmActionModal
          isOpen={isSuccessModal}
          onClose={() => setIsSuccessModal(false)}
          type="success"
          title="Verification Successful"
          message={
            <>
              You have successfully verified this payment made by{" "}
              <strong>{selectedPayment?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedPayment?.id}"</strong>
            </>
          }
        />
      )}
    </div>
  );
};

export default PaymentPage;