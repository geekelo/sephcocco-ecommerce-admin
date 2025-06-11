import React, { useState } from "react";
import SearchBar from "../components/SearchBar";
import OrderTable from "../components/OrderTable";
import OrderSummary from "../components/OrderSummary";
import "../styles/OrderPage.css";
import { initialOrders, mockCategories, mockProduct } from "../constants/data";
import EditProductModal from "../components/EditModal";
import ProductDetails from "../components/ProductDetails";
import PaymentSummary from "../components/PaymentSummary";
import ConfirmActionModal from "../components/ConfirmActionModal";
import UpdateOrderStatusModal from "../components/UpdateOrderStatusModal";
import FlexibleTable from "../components/FlexibleTable";
import { EmptyState } from "../components/EmptyState";
import { orderActions } from "../columns/orderActions";
import { orderColumns } from "../columns/orderColumns";


const OrderPage = () => {
  // Table column configuration
  // const orderColumns = [
  //   { id: "id", label: "Order ID", className: "order-id" },
  //   { id: "customer", label: "Customer", className: "customer" },
  //   { id: "status", label: "Status", className: "status" },
  //   { id: "amount", label: "Total Amount", className: "amount" },
  //   { id: "date", label: "Date", className: "date" },
  //   { id: "action", label: "Action", className: "action" },
  // ];

  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isViewPaymentModal, setIsViewPaymentModal] = useState(false);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isUpdateStatusModal, setIsUpdateStatusModal] = useState(false);
  const [isDiscardOrderModal, setIsDiscardOrderModal] = useState(false);
  const [isDiscardPaymentModal, setIsDiscardPaymentModal] = useState(false);
  
  // Add state for order summary
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = () => {
    console.log("Filter functionality to be implemented");
  };

  const handlePaymentBack = () => {
    setIsViewPaymentModal(false);
  };

  const handleEditPayment = () => {
    setIsDeleteModal(false);
    setIsViewModal(false);
    setIsEditModal(true);
  };

  const handleDeletePayment = () => {
    setIsEditModal(false);
    setIsViewModal(false);
    setIsDeleteModal(true);
  };

  const handleDiscardPayment = () => {
    setIsDiscardPaymentModal(true);
  };

  const handleConfirmDiscardPayment = () => {
    console.log("Discarding payment for:", selectedOrder?.id);
    setIsViewPaymentModal(false);
    setIsDiscardPaymentModal(false);
  };

  const handleVerify = () => {
    console.log("Verifying payment for:", selectedOrder?.id);
    setIsVerifyModal(true);
  };

  const handleProductViewPayment = () => {
    setIsEditModal(false);
    setIsDeleteModal(false);
    setIsViewModal(true);
  };

  const handleEdit = () => {
    setIsViewModal(false);
    setIsDeleteModal(false);
    setIsEditModal(true);
  };

  const handleDelete = () => {
    setIsViewModal(false);
    setIsEditModal(false);
    setIsDeleteModal(true);
  };

  const handleConfirm = () => {
    console.log("Deleting product:", mockProduct.name);
    setIsDeleteModal(false);
  };

  const handleVerifyConfirm = () => {
    console.log("Payment verified successfully");
    setIsVerifyModal(false);
    setIsSuccessModal(true);
  };

  const handlePaymentViewOrder = () => {
    setIsViewPaymentModal(false);
    setShowOrderSummary(false);
  };

  const handleViewPayment = () => {
    setIsViewPaymentModal(true);
  };

  const handleView = () => {
    setIsEditModal(false);
    setIsDeleteModal(false);
    setIsViewModal(true);
  };

  // Handler for viewing an order
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderSummary(true);
  };

  // Handler for going back to order list
  const handleBackToOrders = () => {
    setShowOrderSummary(false);
    setSelectedOrder(null);
    setIsViewModal(false);
    setIsEditModal(false);
    setIsDeleteModal(false);
  };

  // Handler for updating order status
  const handleUpdateStatus = () => {
    setIsUpdateStatusModal(true);
  };

  const handleConfirmStatusUpdate = (newStatus) => {
    console.log("Updating order status to:", newStatus, "for order:", selectedOrder.id);
    // Update the order status in your state/backend here
    // You might want to update the selectedOrder state or refetch data
  };

  // Handler for discarding order
  const handleDiscardOrder = () => {
    setIsDiscardOrderModal(true);
  };

  const handleConfirmDiscardOrder = () => {
    console.log("Discarding order:", selectedOrder.id);
    setShowOrderSummary(false);
    setIsDiscardOrderModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="order-page">
      {!showOrderSummary ? (
        // Order list view
        <>
          <SearchBar
            onSearch={handleSearchChange}
            onFilter={handleFilter}
            searchTerm={searchTerm}
          />
          <div className="order-table-container">
             <FlexibleTable
  data={initialOrders} 
  columns={orderColumns}
  actions={orderActions}
  keyField="id"
  onRowClick={handleViewOrder}

  className="orders-table"

  emptyState={
    <EmptyState 
      title="No orders found" 
    
  
      searchTerm={searchTerm} 
    />
  }
/>
            {/* <OrderTable
              orders={initialOrders}
              columns={orderColumns}
              keyField="id"
              onViewOrder={handleViewOrder}
            /> */}
          </div>
        </>
      ) : (
        <>
          <OrderSummary
            order={selectedOrder}
            onBack={handleBackToOrders}
            onUpdateStatus={handleUpdateStatus}
            onDiscard={handleDiscardOrder}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onViewPayment={handleViewPayment}
          />
        </>
      )}

      {/* Payment Summary Modal */}
      {isViewPaymentModal && (
        <PaymentSummary
          order={selectedOrder}
          onBack={handlePaymentBack}
          onViewOrder={handlePaymentViewOrder}
          onVerify={handleVerify}
          onDiscard={handleDiscardPayment}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
          onView={handleProductViewPayment}
        />
      )}

      {/* Product Details Modal */}
      {isViewModal && (
        <ProductDetails
          product={mockProduct}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setIsViewModal(false)}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModal && (
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => setIsEditModal(false)}
          product={mockProduct}
          categories={mockCategories}
        />
      )}

      {/* Update Order Status Modal */}
      {isUpdateStatusModal && (
        <UpdateOrderStatusModal
          isOpen={isUpdateStatusModal}
          onClose={() => setIsUpdateStatusModal(false)}
          onConfirm={handleConfirmStatusUpdate}
          currentStatus={selectedOrder?.status}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      {isDeleteModal && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onConfirm={handleConfirm}
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

      {/* Discard Order Confirmation Modal */}
      {isDiscardOrderModal && (
        <ConfirmActionModal
          isOpen={isDiscardOrderModal}
          onClose={() => setIsDiscardOrderModal(false)}
          onConfirm={handleConfirmDiscardOrder}
          type="discard"
          title="Confirm Discard Order"
          message={
            <>
              Are you sure you want to discard order{" "}
              <strong>#{selectedOrder?.id}</strong>? This action cannot be undone.
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
              Are you sure you want to discard this payment? This action cannot be undone.
            </>
          }
        />
      )}

      {/* Verify Payment Confirmation Modal */}
      {isVerifyModal && (
        <ConfirmActionModal
          isOpen={isVerifyModal}
          onClose={() => setIsVerifyModal(false)}
          onConfirm={handleVerifyConfirm}
          type="verify"
          title="Confirm Verification"
          message={
            <>
              Are you sure you want to verify this payment made by{" "}
              <strong>{selectedOrder?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>?
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
              <strong>{selectedOrder?.customerName}</strong> with Payment ID{" "}
              <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>
            </>
          }
        />
      )}
    </div>
  );
};

export default OrderPage;