import React, { useMemo, useState } from "react";
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
import EmailModal from "../components/EmailModal";
import FlexibleTable from "../components/FlexibleTable";
import { paymentActions } from "../columns/paymentActions";
import { createPaymentColumns } from "../columns/paymentColumns";
import { EmptyState } from "../components/EmptyState";
import { useViewPayment } from "../hooks/usePayment";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Pagination from "../components/Pagination";
import { useUpdatePaymentStatus } from "../hooks/useUpdatePaymentStatus";

const itemsPerPage = 10;

const PaymentPage = () => {
  // Add searchBarState for consistent UI state management
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    status: "All Status", 
    startDate: "",
    endDate: ""
  });

  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const activeOutlet = getActiveOutlet();
  
  const { data: payment, isLoading, refetch } = useViewPayment(
    activeOutlet, 
    filters, 
    currentPage,
    itemsPerPage,
  );
  
  const { mutateAsync: updatePaymentStatus, isLoading: isUpdatingStatus } = useUpdatePaymentStatus();

  console.log('pay', payment);
  const meta = payment?.meta || {};
  
  // Extract payments from orders for the payment table
  const paymentData = payment?.payments?.flatMap(payment =>
    payment.paid_orders?.map(order => ({
      id: payment.id, // Add this for unique identification
      customerName: order.customer?.name,
      customerEmail: order.customer?.email,
      orderId: order.id,
      phoneNumber: order.customer?.phone_number,
      orderDate: order.created_at,
      orderStatus: order.status,
      paymentMethod: payment.payment_method, // Use payment.payment_method instead
      status: payment.status,
      notes: order.notes,
      products: order.product, // This is a single object, not an array
      amount: payment.amount,
      paymentDate: payment.created_at,
      transactionId: payment.transaction_id,
      paymentDate: payment.created_at,
      orderNumber: order.order_number,
      // Add any other fields you need
      totalPrice: order.total_price
    })) || []
  ) || [];
  
const sortedPaymentData = [...paymentData].sort((a, b) => 
  new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime() // DESC
  // new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime() // ASC
);

console.log('oddd', sortedPaymentData);

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
  const [isVerifying, setIsVerifying] = useState(false); // Track verify action specifically
  
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

  const handleDiscardPayment = async () => {
    try {
      const payload = {
        [`sephcocco_${activeOutlet}_payment`]: {
          status: "Declined"
        }
      };

      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId: selectedPayment?.id,
        payload
      });

      console.log("Payment discarded successfully");
      setIsPaymentSummaryModal(false);
      setIsDiscardPaymentModal(false);
      setSelectedPayment(null);
      
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Error discarding payment:", error);
      // You might want to show an error toast here
    }
  };

  const handleConfirmDiscardPayment = () => {
    setIsDiscardPaymentModal(true);
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

  const handleVerifyConfirm = async () => {
    try {
      setIsVerifying(true); // Set verifying state
      
      const payload = {
        [`sephcocco_${activeOutlet}_payment`]: {
          status: "payment confirmed"
        }
      };

      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId: selectedPayment?.id,
        payload
      });

      console.log("Payment verified successfully");
      setIsVerifyPaymentModal(false);
      setIsSuccessModal(true);
      
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Error verifying payment:", error);
      // You might want to show an error toast here
    } finally {
      setIsVerifying(false); // Reset verifying state
    }
  };

  const handleViewOrder = () => {
    console.log("Viewing order for payment:", selectedPayment?.id);
    // You can implement navigation to order details here
    setIsPaymentSummaryModal(false);
  };

  // Handler for viewing a payment (clicking View button in table)
  const handleViewPayment = (payment) => {
    console.log('view',payment);
    
    setSelectedPayment(payment);
    setIsPaymentSummaryModal(true);
  };

  // Handler for updating payment status
  const handleUpdatePaymentStatus = () => {
    setIsUpdatePaymentStatusModal(true);
  };

  const handleConfirmStatusUpdate = async (newStatus) => {
    try {
      const payload = {
        [`sephcocco_${activeOutlet}_payment`]: {
          status: newStatus
        }
      };

      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId: selectedPayment?.id,
        payload
      });

      console.log("Payment status updated successfully to:", newStatus);
      setIsUpdatePaymentStatusModal(false);
      
      // Refetch data to update the UI
      refetch();
    } catch (error) {
      console.error("Error updating payment status:", error);
      // You might want to show an error toast here
    }
  };

  const paymentColumns = useMemo(() => createPaymentColumns(handleViewPayment));

  // Handler for sending email
  const handleSendEmail = () => {
    if (selectedPayment?.customerEmail) {
      setIsEmailModal(true);
    } else {
      alert('Customer email is not available for this payment.');
    }
  };

  // Updated to handle the new sort parameters from SearchBar
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for payments
    sort_by_stock  // Accept but ignore sort parameters for payments
  }) => {
    // Only use the parameters that payments need
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
    
    // Update search bar state to maintain UI state
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  // Manual search handler - triggered when user types and presses Enter
  const handleManualSearch = (searchTerm) => {
    handleApplyFilters({
      status: "",
      search_terms: searchTerm,
      start_date: "",
      end_date: "",
      sort_by_likes: "", // Clear sort filters
      sort_by_stock: ""  // Clear sort filters
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="order-page">
      <SearchBar
        onApply={handleApplyFilters}
        onManualSearch={handleManualSearch} // Add manual search handler
        filterOptions={["All Status", "Pending", "Paid", "Payment Confirmed", "Cancelled", "Declined"]}
        categoryOptions={[]} // Explicitly disable category filtering
        sortOptions={[]} // Explicitly disable sort options
        placeholder="Search..."
        filterLabel="Filter by"
        showDate={true} // Enable date filtering for payments
        initialValues={searchBarState} // Pass persistent state
      />
      <div className="order-table-container">
        {isLoading ? (
          <LoadingSkeleton itemsPerPage={itemsPerPage} />
        ) : paymentData?.length > 0 ? (
          <>
            <FlexibleTable
              data={sortedPaymentData}
              columns={paymentColumns}
              actions={paymentActions}
              keyField="id"
              onRowClick={handleViewPayment}
              className="orders-table"
              emptyState={
                <EmptyState 
                  title="No payments records found" 
                  searchTerm={filters?.search_terms} 
                />
              }
            />

            <Pagination
            currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={Number(meta?.total_pages || 1)}
              onPageChange={handlePageChange}
              totalItems={+meta?.total_count || 0}
              showInfo={true}
              name='Payments'
            />
          </>
        ) : (
          <EmptyState title="No payment found" searchTerm={filters?.search_terms} />
        )}
      </div>

      {/* Payment Summary Modal - Enhanced with Email Button */}
      {isPaymentSummaryModal && (
        <PaymentSummary
          order={selectedPayment}
          onBack={handlePaymentSummaryBack}
          onViewOrder={handleViewOrder}
          onVerify={handleVerifyPayment}
          onDiscard={handleConfirmDiscardPayment}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onView={handleViewProduct}
          onSendEmail={handleSendEmail} // Pass email handler
          isVerifying={isVerifying} // Pass verify loading state specifically
        />
      )}

      {/* Product Details Modal */}
      {isViewProductModal && (
        <ProductDetails
        style={{marginTop: '0px'}}
          product={selectedPayment?.products}
          onClose={() => setIsViewProductModal(false)}
        />
      )}

      {/* Edit Product Modal */}
      {isEditProductModal && (
        <EditProductModal
          isOpen={isEditProductModal}
          onClose={() => setIsEditProductModal(false)}
          product={selectedPayment?.products}
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
          isLoading={isUpdatingStatus}
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
          onConfirm={handleDiscardPayment}
          type="discardPayment"
          title="Confirm Discard Payment"
          message={
            <>
              Are you sure you want to discard payment{" "}
              <strong>{selectedPayment?.id}</strong>? This action cannot be undone.
            </>
          }
          isLoading={isUpdatingStatus}
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
          isLoading={isUpdatingStatus}
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