import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useActiveDepartment } from "../hooks/useGetActiveDepartment";
import { useUpdatePaymentStatus } from "../hooks/useUpdatePaymentStatus";
import { useDiscardOrderItem } from "../hooks/useDiscardOrderItem";
import { useGetWaiters } from "../hooks/useGetWaiters";

const itemsPerPage = 10;

const OrderPage = () => {
  // Lift filter state to OrderPage level to persist across navigation
  const [searchBarState, setSearchBarState] = useState({
    search: "",
    department_id: "",
    status: "All Status", 
    startDate: "",
    endDate: ""
  });

  const [activeTab, setActiveTab] = useState("all");

  const [filters, setFilters] = useState({
    search_terms: "",
    status: "",
    department_id: "",
    start_date: "",
    end_date: "",
    waiters: false,
    waiter_id: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const activeOutlet = getActiveOutlet();

  const { data, isLoading, refetch } = useGetOrder(activeOutlet, filters,
    currentPage,
    itemsPerPage,
  );
  const { data: department = [] } = useActiveDepartment(activeOutlet);
  const { data: waitersData } = useGetWaiters();
  const waiterUsers = useMemo(
    () => (waitersData?.users || waitersData?.waiters || waitersData?.data || []),
    [waitersData]
  );
  const { mutateAsync: updatePaymentStatus, isPending: isUpdatingStatus } = useUpdatePaymentStatus();
  const { mutateAsync: discardOrderItem, isPending: isDiscardingItem } = useDiscardOrderItem();
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [isUpdateItemStatusModal, setIsUpdateItemStatusModal] = useState(false);
  const [isDiscardItemModal, setIsDiscardItemModal] = useState(false);

  // Waiter searchable dropdown state (visible on Waiters tab only)
  const [waiterQuery, setWaiterQuery] = useState("");
  const [waiterOpen, setWaiterOpen] = useState(false);
  const waiterWrapRef = useRef(null);

  const selectedWaiter = useMemo(() => {
    if (!filters.waiter_id) return null;
    return waiterUsers.find(u => u.id === filters.waiter_id) || null;
  }, [filters.waiter_id, waiterUsers]);

  const filteredWaiters = useMemo(() => {
    const q = (waiterQuery || "").trim().toLowerCase();
    if (!q) return waiterUsers;
    return waiterUsers.filter(u => {
      const name = (u.name || u.full_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [waiterQuery, waiterUsers]);

  useEffect(() => {
    // Keep the input display in sync with the selected waiter id.
    // When cleared, show empty so placeholder appears.
    setWaiterQuery(selectedWaiter?.name || selectedWaiter?.full_name || "");
  }, [selectedWaiter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onDocClick = (e) => {
      if (!waiterWrapRef.current) return;
      if (!waiterWrapRef.current.contains(e.target)) setWaiterOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // One row per grouped order; individual orders attached for OrderSummary
  const orders = useMemo(() => {
    const groups = Array.isArray(data?.orders?.grouped_orders)
      ? data.orders.grouped_orders
      : [];
    return groups
      .map(group => {
        const individualOrders = Array.isArray(group.orders) ? group.orders : [];
        const first = individualOrders[0] || {};
        const paymentDetails =
          group.payment_details ||
          individualOrders.find(o => o.payment_details)?.payment_details ||
          null;
        return {
          id: group.order_number,
          order_number: group.order_number,
          customer: group.customer || first.customer,
          // show single product name, or "N products" for multi-item orders
          product: {
            name:
              individualOrders.length === 1
                ? first.product?.name || first.product_details?.name || ''
                : `${individualOrders.length} products`,
          },
          quantity: group.total_quantity,
          total_price: group.total_price,
          unit_price: individualOrders.length === 1 ? first.unit_price : '—',
          total_cost: individualOrders
            .reduce((s, o) => s + parseFloat(o.total_cost || 0), 0)
            .toFixed(1),
          current_stage: first.current_stage || '',
          status: first.status || group.payment_status,
          created_at: first.created_at || '',
          stages: first.stages || [],
          additional_notes: first.additional_notes || '',
          payment_details: paymentDetails,
          payment_status: group.payment_status,
          payment_method: group.payment_method || paymentDetails?.payment_method,
          payment_state: group.payment_state,
          delivery_location: group.delivery_location,
          orders: individualOrders,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    department_id,
    search_terms, 
    start_date, 
    end_date, 
    sort_by_likes, // Accept but ignore sort parameters for orders
    sort_by_stock  // Accept but ignore sort parameters for orders
  }) => {
    // Update both the API filters and the search bar state
    // Note: We ignore sort parameters since orders don't use them
    // IMPORTANT: merge with existing filters so tab-specific flags (waiters/waiter_id)
    // are not lost when applying search/date/status filters.
    setFilters(prev => ({
      ...prev,
      status,
      department_id,
      search_terms,
      start_date,
      end_date,
      // keep the current tab reflected in the request
      waiters: activeTab === "waiters",
    }));
    setCurrentPage(1);
    
    // Update search bar state to maintain UI state
    setSearchBarState({
      search: search_terms || "",
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Status",
      department_id: department_id ? department_id.charAt(0).toUpperCase() + department_id.slice(1) : "All Department",
      startDate: start_date || "",
      endDate: end_date || ""
    });
  };

  // Manual search handler - triggered when user types and presses Enter
  const handleManualSearch = (searchTerm) => {
    // Clear all filters and only keep the search term
    handleApplyFilters({
      status: "", // Clear status filter
      department_id: "",
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

  // item can be a single order object or an array (bulk selection)
  const handleUpdateItemStatus = (item) => {
    setSelectedOrderItem(Array.isArray(item) ? item : [item]);
    setIsUpdateItemStatusModal(true);
  };

  const handleDiscardItem = (item) => {
    setSelectedOrderItem(Array.isArray(item) ? item : [item]);
    setIsDiscardItemModal(true);
  };

  const handleConfirmDiscardItem = async () => {
    try {
      const items = Array.isArray(selectedOrderItem) ? selectedOrderItem : [selectedOrderItem];
      await discardOrderItem({
        active_outlet: activeOutlet,
        orderIds: items.map(o => o?.id),
      });
      setIsDiscardItemModal(false);
      setSelectedOrderItem(null);
      refetch();
    } catch (error) {
      console.error("Error discarding order item:", error);
    }
  };

  const getPaymentId = () =>
    (selectedOrder?.orders || []).find(o => o.payment_details)?.payment_details?.id
    || selectedOrder?.payment_details?.id;

  const handleVerifyConfirm = async () => {
    try {
      setIsVerifying(true);
      const paymentId = getPaymentId();
      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId,
        payload: { [`sephcocco_${activeOutlet}_payment`]: { status: "payment confirmed" } },
      });
      // Update selectedOrder locally so PaymentSummary switches to "Print Receipt"
      setSelectedOrder(prev => {
        if (!prev) return prev;
        const updatedOrders = (prev.orders || []).map(o =>
          o.payment_details?.id === paymentId
            ? { ...o, payment_details: { ...o.payment_details, status: "payment confirmed" } }
            : o
        );
        return {
          ...prev,
          payment_details: prev.payment_details
            ? { ...prev.payment_details, status: "payment confirmed" }
            : prev.payment_details,
          orders: updatedOrders,
        };
      });
      setIsVerifyModal(false);
      setIsSuccessModal(true);
      refetch();
    } catch (error) {
      console.error("Error verifying payment:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDiscardPayment = async () => {
    try {
      await updatePaymentStatus({
        active_outlet: activeOutlet,
        paymentId: getPaymentId(),
        payload: { [`sephcocco_${activeOutlet}_payment`]: { status: "Declined" } },
      });
      setIsViewPaymentModal(false);
      setIsDiscardPaymentModal(false);
      refetch();
    } catch (error) {
      console.error("Error discarding payment:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      waiters: tab === "waiters",
      waiter_id: "",
    }));
    setCurrentPage(1);
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
                            extraFilterOptions={department?.map(v => ({ label: v.name, value: v.id })) || []}
  extraFilterLabel="Filter by Department"
  extraFilterKey="department_id"
  showExtraFilter = {true}
            // Pass the persistent state as initial values
            initialValues={searchBarState}
          />

          <div className="order-tabs">
            <button
              className={`order-tab${activeTab === "all" ? " active" : ""}`}
              onClick={() => handleTabChange("all")}
            >
              All
            </button>
            <button
              className={`order-tab${activeTab === "waiters" ? " active" : ""}`}
              onClick={() => handleTabChange("waiters")}
            >
              Waiters
            </button>
          </div>

          {activeTab === "waiters" && (
            <div className="waiter-tab-section">
              <div className="waiter-tab-head">
                <div className="waiter-tab-title">Waiter Orders</div>
                <div className="waiter-tab-subtitle">
                  Filter the orders list by a specific waiter (search by name/email).
                </div>
              </div>

              <div className="waiter-combobox" ref={waiterWrapRef}>
                <div className="waiter-combobox-inputRow">
                  <input
                    className="waiter-combobox-input"
                    value={waiterQuery}
                    placeholder="All waiters"
                    onChange={(e) => {
                      setWaiterQuery(e.target.value);
                      setWaiterOpen(true);
                    }}
                    onFocus={() => setWaiterOpen(true)}
                  />
                  {!!filters.waiter_id && (
                    <button
                      type="button"
                      className="waiter-combobox-clear"
                      onClick={() => {
                        setFilters(prev => ({ ...prev, waiter_id: "" }));
                        setCurrentPage(1);
                        setWaiterQuery("");
                        setWaiterOpen(false);
                      }}
                      aria-label="Clear waiter filter"
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
                </div>

                {waiterOpen && (
                  <div className="waiter-combobox-popover">
                    <button
                      type="button"
                      className={`waiter-combobox-item ${!filters.waiter_id ? "active" : ""}`}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, waiter_id: "" }));
                        setCurrentPage(1);
                        setWaiterQuery("");
                        setWaiterOpen(false);
                      }}
                    >
                      All waiters
                    </button>
                    {filteredWaiters.length === 0 ? (
                      <div className="waiter-combobox-empty">No matches</div>
                    ) : (
                      filteredWaiters.map((u) => {
                        const label = u.name || u.full_name || u.email || "—";
                        const sub = u.email && (u.name || u.full_name) ? u.email : "";
                        return (
                          <button
                            key={u.id}
                            type="button"
                            className={`waiter-combobox-item ${filters.waiter_id === u.id ? "active" : ""}`}
                            onClick={() => {
                              setFilters(prev => ({ ...prev, waiter_id: u.id }));
                              setCurrentPage(1);
                              setWaiterQuery(label);
                              setWaiterOpen(false);
                            }}
                          >
                            <div className="waiter-combobox-itemName">{label}</div>
                            {sub && <div className="waiter-combobox-itemSub">{sub}</div>}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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
          onViewPayment={() => setIsViewPaymentModal(true)}
          onUpdateItemStatus={handleUpdateItemStatus}
          onDiscardItem={handleDiscardItem}
        />
      )}

      {/* Modals */}
      {isViewPaymentModal && (
        <PaymentSummary
          style={{ paddingLeft: '240px' }}
          order={{
            // prefer payment_details from individual orders; fall back to group-level
            ...(
              (selectedOrder?.orders || []).find(o => o.payment_details)?.payment_details
              || selectedOrder?.payment_details
              || {}
            ),
            paid_orders: (selectedOrder?.orders || []).map(o => ({
              ...o,
              customer: o.customer || selectedOrder?.customer,
            })),
          }}
          onBack={() => setIsViewPaymentModal(false)}
          onViewOrder={() => {
            setIsViewPaymentModal(false);
            setShowOrderSummary(false);
          }}
          onVerify={() => setIsVerifyModal(true)}
          onDiscard={() => setIsDiscardPaymentModal(true)}
          isVerifying={isVerifying}
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
          orderIds={selectedOrder?.orders?.map(o => o.id) || [selectedOrder?.id]}
          onClose={() => setIsUpdateStatusModal(false)}
          onConfirm={(newStatus) => {
            setIsUpdateStatusModal(false);
            setShowOrderSummary(false);
            refetch();
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
            <p>Are you sure you want to delete <strong>{selectedOrder?.product?.name}</strong>?</p>
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
            <p>Are you sure you want to discard order <strong>#{selectedOrder?.id}</strong>? This action cannot be undone.</p>
          }
        />
      )}

      {isDiscardPaymentModal && (
        <ConfirmActionModal
          isOpen={isDiscardPaymentModal}
          onClose={() => setIsDiscardPaymentModal(false)}
          onConfirm={handleDiscardPayment}
          type="discardPayment"
          title={isUpdatingStatus ? "Discarding..." : "Confirm Discard Payment"}
          message={
            <p>Are you sure you want to discard this payment? This action cannot be undone.</p>
          }
          isLoading={isUpdatingStatus}
        />
      )}

      {isVerifyModal && (
        <ConfirmActionModal
          isOpen={isVerifyModal}
          onClose={() => setIsVerifyModal(false)}
          onConfirm={handleVerifyConfirm}
          type="verify"
          title={isVerifying ? "Confirming..." : "Confirm Verification"}
          message={
            <p>Are you sure you want to verify this payment made by <strong>{selectedOrder?.customer?.name}</strong> with Payment ID <strong>"{getPaymentId()}"</strong>?</p>
          }
          isLoading={isVerifying}
        />
      )}

      {isSuccessModal && (
        <ConfirmActionModal
          isOpen={isSuccessModal}
          onClose={() => setIsSuccessModal(false)}
          type="success"
          title="Verification Successful"
          message={
            <p>You have successfully verified this payment made by <strong>{selectedOrder?.customer?.name}</strong> with Payment ID <strong>"{selectedOrder?.payment_details?.id}"</strong></p>
          }
        />
      )}

      {isUpdateItemStatusModal && (
        <UpdateOrderStatusModal
          isOpen={isUpdateItemStatusModal}
          orderIds={(Array.isArray(selectedOrderItem) ? selectedOrderItem : [selectedOrderItem]).map(o => o?.id)}
          onClose={() => { setIsUpdateItemStatusModal(false); setSelectedOrderItem(null); }}
          onConfirm={(newStatus) => {
            setIsUpdateItemStatusModal(false);
            setSelectedOrderItem(null);
            refetch();
          }}
          currentStatus={
            Array.isArray(selectedOrderItem)
              ? selectedOrderItem[0]?.status
              : selectedOrderItem?.status
          }
        />
      )}

      {isDiscardItemModal && (() => {
        const items = Array.isArray(selectedOrderItem) ? selectedOrderItem : [selectedOrderItem];
        const label = items.length === 1
          ? (items[0]?.product?.name || items[0]?.product_details?.name || 'this item')
          : `${items.length} items`;
        return (
          <ConfirmActionModal
            isOpen={isDiscardItemModal}
            onClose={() => { setIsDiscardItemModal(false); setSelectedOrderItem(null); }}
            onConfirm={handleConfirmDiscardItem}
            type="discard"
            title={isDiscardingItem ? "Discarding..." : "Confirm Discard"}
            message={<p>Are you sure you want to discard <strong>{label}</strong>? This action cannot be undone.</p>}
            isLoading={isDiscardingItem}
          />
        );
      })()}
    </div>
  );
};

export default OrderPage;