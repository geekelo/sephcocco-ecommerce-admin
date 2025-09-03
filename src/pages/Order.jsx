import React, { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import FlexibleTable from "../components/FlexibleTable";
import Pagination from "../components/Pagination";
import OrderSummary from "../components/OrderSummary";
import ProductDetails from "../components/ProductDetails";
import EditProductModal from "../components/EditModal";
import PaymentSummary from "../components/PaymentSummary";
import ConfirmActionModal from "../components/ConfirmActionModal";
import UpdateOrderStatusModal from "../components/UpdateOrderStatusModal";
import { EmptyState } from "../components/EmptyState";
import { orderActions } from "../columns/orderActions";
import { createOrderColumns } from "../columns/orderColumns";
import { useGetOrder } from "../hooks/useGetOrder";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import LoadingSkeleton from "../components/LoadingSkeleton";
import '../styles/OrderPage.css'

const itemsPerPage = 10;

const OrderPage = () => {
  // Lift filter state to OrderPage level to persist across navigation
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

  const { data, isLoading, refetch } = useGetOrder(activeOutlet, filters, 
    currentPage,
    itemsPerPage,
  );

  // Sort orders by most recent first (descending order)
  const orders = useMemo(() => {
    const ordersData = data?.orders || [];
    return ordersData.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at).getTime();
      const dateB = new Date(b.created_at || b.updated_at).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [data?.orders]);

  const meta = data?.meta || {};

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [isEditModal, setIsEditModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [isViewPaymentModal, setIsViewPaymentModal] = useState(false);
  const [isVerifyModal, setIsVerifyModal] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isUpdateStatusModal, setIsUpdateStatusModal] = useState(false);
  const [isDiscardOrderModal, setIsDiscardOrderModal] = useState(false);
  const [isDiscardPaymentModal, setIsDiscardPaymentModal] = useState(false);

  // Updated to handle the new sort parameters from SearchBar
  const handleApplyFilters = ({ 
    status, 
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for orders
    sort_by_stock  // Accept but ignore sort parameters for orders
  }) => {
    // Update both the API filters and the search bar state
    // Note: We ignore sort parameters since orders don't use them
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
    // Clear all filters and only keep the search term
    handleApplyFilters({
      status: "", // Clear status filter
      search_terms: searchTerm,
      start_date: "", // Clear start date filter
      end_date: "", // Clear end date filter
      sort_by_likes: "", // Clear sort filters
      sort_by_stock: ""  // Clear sort filters
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderSummary(true);
  };

  const handleBackToOrders = () => {
    setShowOrderSummary(false);
    setSelectedOrder(null);
    setIsViewModal(false);
    setIsEditModal(false);
    setIsDeleteModal(false);
  };

  const orderColumns = useMemo(() => createOrderColumns(handleViewOrder), []);


  return (
    <div className="order-page" style={{position: 'initial'}}>
      {!showOrderSummary ? (
        <>
          <SearchBar
            onApply={handleApplyFilters}
            onManualSearch={handleManualSearch} // Add manual search handler
            filterOptions={["All Status", "Pending", "Paid", "Payment Confirmed","Delivering", "Completed", "Cancelled"]}
            categoryOptions={[]} // Explicitly pass empty array to disable category filtering
            sortOptions={[]} // Explicitly pass empty array to disable sort options
            placeholder="Search orders..."
            filterLabel="Filter by"
            showDate={true} // Explicitly enable date filtering
            // Pass the persistent state as initial values
            initialValues={searchBarState}
          />

          <div className="order-table-container">
            {isLoading ? (
              <LoadingSkeleton itemsPerPage={itemsPerPage} />
            ) : orders.length > 0 ? (
              <>
                <FlexibleTable
                  data={orders}
                  columns={orderColumns}
                  actions={orderActions}
                  keyField="id"
                   onRowClick={(order) => { 
    handleViewOrder(order)  
  }}
                  onActionClick={(actionKey, data) => {
                    if (actionKey === "view") {
                      handleViewOrder(data);
                    }
                  }}
                  className="orders-table"
                />

                <Pagination
                  name='Orders'
                   currentPage={currentPage}
                  totalPages={+meta.total_pages || 1}
                  onPageChange={handlePageChange}
                  totalItems={+meta.total_count || 0}
                  itemsPerPage={itemsPerPage}
                  showInfo={true}
                />
              </>
            ) : (
              <EmptyState message="No orders found" searchTerm={filters.search_terms} />
            )}
          </div>
        </>
      ) : (
        <OrderSummary
          order={selectedOrder}
          onBack={handleBackToOrders}
          onUpdateStatus={() => setIsUpdateStatusModal(true)}
          onDiscard={() => setIsDiscardOrderModal(true)}
          onEdit={() => setIsEditModal(true)}
          onDelete={() => setIsDeleteModal(true)}
          onView={() => setIsViewModal(true)}
          onViewPayment={() =>
          {
            console.log('click me')
            
             setIsViewPaymentModal(true)
            }
          }
        />
      )}

      {/* Modals */}
      {isViewPaymentModal && (
        <PaymentSummary
         order={selectedOrder?.[`sephcocco_${activeOutlet}_payment`]}
          onBack={() => setIsViewPaymentModal(false)}
          onViewOrder={() => {
            setIsViewPaymentModal(false);
            setShowOrderSummary(false);
          }}
          onVerify={() => setIsVerifyModal(true)}
          onDiscard={() => setIsDiscardPaymentModal(true)}
          onEdit={() => setIsEditModal(true)}
          onDelete={() => setIsDeleteModal(true)}
          onView={() => setIsViewModal(true)}
        />
      )}

      {isViewModal && (
      
             <ProductDetails style={{paddingLeft: '240px'}} product={selectedOrder?.product} onClose={() => setIsViewModal(false)} />
        

     
      )}

      {isEditModal && (
        <EditProductModal
          isOpen={isEditModal}
          onClose={() => setIsEditModal(false)}
          product={selectedOrder?.product}
        />
      )}

      {isUpdateStatusModal && (
        <UpdateOrderStatusModal
          isOpen={isUpdateStatusModal}
          orderId={selectedOrder?.id}
          onClose={() => setIsUpdateStatusModal(false)}
          onConfirm={(newStatus) => {
            console.log("Updating order status to:", newStatus);
            setIsUpdateStatusModal(false);
            setShowOrderSummary(false)
            refetch()
          }}
          currentStatus={selectedOrder?.status}
        />
      )}

      {isDeleteModal && (
        <ConfirmActionModal
          isOpen={isDeleteModal}
          onClose={() => setIsDeleteModal(false)}
          onConfirm={() => {
            console.log("Deleting product:", selectedOrder?.product?.name);
            setIsDeleteModal(false);
          }}
          type="delete"
          title="Confirm Delete"
          message={
            <>Are you sure you want to delete <strong>{selectedOrder?.product?.name}</strong>?</>
          }
        />
      )}

      {isDiscardOrderModal && (
        <ConfirmActionModal
          isOpen={isDiscardOrderModal}
          onClose={() => setIsDiscardOrderModal(false)}
          onConfirm={() => {
            console.log("Discarding order:", selectedOrder?.id);
            setShowOrderSummary(false);
            setIsDiscardOrderModal(false);
            setSelectedOrder(null);
          }}
          type="discard"
          title="Confirm Discard Order"
          message={
            <>Are you sure you want to discard order <strong>#{selectedOrder?.product?.name}</strong>? This action cannot be undone.</>
          }
        />
      )}

      {isDiscardPaymentModal && (
        <ConfirmActionModal
          isOpen={isDiscardPaymentModal}
          onClose={() => setIsDiscardPaymentModal(false)}
          onConfirm={() => {
            console.log("Discarding payment for order:", selectedOrder?.id);
            setIsViewPaymentModal(false);
            setIsDiscardPaymentModal(false);
          }}
          type="discardPayment"
          title="Confirm Discard Payment"
          message={
            <>Are you sure you want to discard this payment? This action cannot be undone.</>
          }
        />
      )}

      {isVerifyModal && (
        <ConfirmActionModal
          isOpen={isVerifyModal}
          onClose={() => setIsVerifyModal(false)}
          onConfirm={() => {
            console.log("Payment verified successfully");
            setIsVerifyModal(false);
            setIsSuccessModal(true);
          }}
          type="verify"
          title="Confirm Verification"
          message={
            <>Are you sure you want to verify this payment made by <strong>{selectedOrder?.customer?.name}</strong> with Payment ID <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>?</>
          }
        />
      )}

      {isSuccessModal && (
        <ConfirmActionModal
          isOpen={isSuccessModal}
          onClose={() => setIsSuccessModal(false)}
          type="success"
          title="Verification Successful"
          message={
            <>You have successfully verified this payment made by <strong>{selectedOrder?.customer?.name}</strong> with Payment ID <strong>"{selectedOrder?.payment_details?.id}"</strong></>
          }
        />
      )}
    </div>
  );
};

export default OrderPage;