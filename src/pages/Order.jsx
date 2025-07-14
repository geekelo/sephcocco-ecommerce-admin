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

const itemsPerPage = 10;

const OrderPage = () => {
  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const activeOutlet = getActiveOutlet();

  const { data, isLoading,refetch } = useGetOrder(activeOutlet, filters, 
  currentPage,
     itemsPerPage,
  );

  const orders = data?.orders || [];
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

  const handleApplyFilters = ({ status, search_terms, start_date, end_date }) => {
    setFilters({ status, search_terms, start_date, end_date });
    setCurrentPage(1);
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
    <div className="order-page">
      {!showOrderSummary ? (
        <>
          <SearchBar
            onApply={handleApplyFilters}
            filterOptions={["All Status", "Pending", "Paid","Delivering", "Completed"]}
            placeholder="Search orders..."
            filterLabel="Filter by"
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
                  onRowClick={handleViewOrder}
                  onActionClick={(actionKey, data) => {
                    if (actionKey === "view") {
                      handleViewOrder(data);
                    }
                  }}
                  className="orders-table"
                />

                <Pagination
                  currentPage={meta.current_page || 1}
                  totalPages={meta.total_pages || 1}
                  onPageChange={handlePageChange}
                  totalItems={meta.total_count || 0}
                  
                  showInfo={true}
                />
              </>
            ) : (
              <EmptyState title="No orders found" searchTerm={filters.search_terms} />
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
          onViewPayment={() => setIsViewPaymentModal(true)}
        />
      )}

      {/* Modals */}
      {isViewPaymentModal && (
        <PaymentSummary
          order={selectedOrder}
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
        <ProductDetails product={selectedOrder?.product} onClose={() => setIsViewModal(false)} />
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
            <>Are you sure you want to discard order <strong>#{selectedOrder?.name}</strong>? This action cannot be undone.</>
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
            <>Are you sure you want to verify this payment made by <strong>{selectedOrder?.customerName}</strong> with Payment ID <strong>"{selectedOrder?.payments?.[0]?.id}"</strong>?</>
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
            <>You have successfully verified this payment made by <strong>{selectedOrder?.customerName}</strong> with Payment ID <strong>"{selectedOrder?.payments?.[0]?.id}"</strong></>
          }
        />
      )}
    </div>
  );
};

export default OrderPage;
