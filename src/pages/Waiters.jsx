import { useState } from 'react';
import { Plus, CheckCircle, Hourglass } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import PlaceOrderModal from '../components/PlaceOrderModal';
import { useGetPendingWaiterOrders } from '../hooks/useGetPendingWaiterOrders';
import { useGetCompletedWaiterOrders } from '../hooks/useGetCompletedWaiterOrders';
import { useGetConfirmedWaiterOrders } from '../hooks/useGetConfirmedWaiterOrders';
import { useCreateWaiterPayment } from '../hooks/useCreateWaiterPayment';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/Stock.css';
import '../styles/Waiters.css';

const ITEMS_PER_PAGE = 10;

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString();
};

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (val) => {
  const num = parseFloat(val || 0);
  return `₦${num.toLocaleString()}`;
};

const getProductName = (order, outlet) => {
  const key = `sephcocco_${outlet}_product`;
  return order?.[key]?.name || order?.product?.name || order?.product_name || '—';
};

const getTableLabel = (order) => order?.address || order?.table_number || 'N/A';

const OrderCard = ({ order, outlet, onMarkPaid, isPaying }) => {
  const productName = getProductName(order, outlet);
  const table       = getTableLabel(order);
  const total       = order?.total_cost || order?.amount || 0;
  const qty         = order?.quantity || 1;
  const isPending   = order?.status === 'pending';

  return (
    <div className={`waiter-order-card ${isPending ? 'card-pending' : 'card-completed'}`}>
      <div className="woc-header">
        <span className="woc-table">{table}</span>
        <div className="woc-meta">
          <span className="woc-time">{formatDate(order?.created_at)}</span>
          <span className="woc-time">{formatTime(order?.created_at)}</span>
          <span className={`waiter-status-badge status-${order?.status}`}>
            {isPending
              ? <Hourglass size={10} style={{ marginRight: 3 }} />
              : <CheckCircle size={10} style={{ marginRight: 3 }} />
            }
            {isPending ? 'Pending' : 'Completed'}
          </span>
        </div>
      </div>

      <div className="woc-body">
        <div className="woc-product-row">
          <span className="woc-product-name">{productName}</span>
          <span className="woc-qty">× {qty}</span>
          <span className="woc-price">{formatCurrency(total)}</span>
        </div>
        {order?.additional_notes && (
          <p className="woc-notes">📝 {order.additional_notes}</p>
        )}
      </div>

      {isPending && (
        <div className="woc-footer">
          <button
            className="waiter-paid-btn"
            onClick={() => onMarkPaid(order)}
            disabled={isPaying}
          >
            {isPaying ? (
              <span className="woc-paying">Processing...</span>
            ) : (
              <><CheckCircle size={14} /> I Have Paid</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="waiter-order-card card-skeleton">
    <div className="skel skel-line w60" />
    <div className="skel skel-line w80 mt8" />
    <div className="skel skel-line w40 mt8" />
  </div>
);

const WaitersPage = () => {
  const active_outlet = getActiveOutlet();

  const [activeTab, setActiveTab]         = useState('pending');
  const [pendingPage, setPendingPage]     = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [payingId, setPayingId]           = useState(null);

  const paymentMutation = useCreateWaiterPayment();

  const {
    data: pendingData,
    isLoading: loadingPending,
    refetch: refetchPending,
  } = useGetPendingWaiterOrders(active_outlet, pendingPage, ITEMS_PER_PAGE);

  const {
    data: completedData,
    isLoading: loadingCompleted,
    refetch: refetchCompleted,
  } = useGetCompletedWaiterOrders(active_outlet, completedPage, ITEMS_PER_PAGE);

  const {
    data: confirmedData,
    isLoading: loadingConfirmed,
    refetch: refetchConfirmed,
  } = useGetConfirmedWaiterOrders(active_outlet, confirmedPage, ITEMS_PER_PAGE);

  const pendingOrders   = pendingData?.orders   || pendingData?.data   || [];
  const completedOrders = completedData?.orders || completedData?.data || [];
  const confirmedOrders = confirmedData?.orders || confirmedData?.data || [];

  const pendingMeta   = pendingData?.meta   || {};
  const completedMeta = completedData?.meta || {};
  const confirmedMeta = confirmedData?.meta || {};

  const pendingTotal   = pendingMeta?.total_count   ?? pendingOrders.length;
  const completedTotal = completedMeta?.total_count ?? completedOrders.length;
  const confirmedTotal = confirmedMeta?.total_count ?? confirmedOrders.length;

  const pendingPages   = pendingMeta?.total_pages   ?? Math.ceil(pendingTotal / ITEMS_PER_PAGE);
  const completedPages = completedMeta?.total_pages ?? Math.ceil(completedTotal / ITEMS_PER_PAGE);
  const confirmedPages = confirmedMeta?.total_pages ?? Math.ceil(confirmedTotal / ITEMS_PER_PAGE);

  // ── Mark as paid ──────────────────────────────────────────────────────────
  const handleMarkPaid = async (order) => {
    setPayingId(order.id);
    try {
      const total = parseFloat(order?.total_cost || order?.amount || 0);
      const payload = {
        [`sephcocco_${active_outlet}_payment`]: {
          orders_ids: [order.id],
          amount: total,
          payment_method: 'bank',
          transaction_id: `WAI-${Date.now()}`,
        },
      };
      await paymentMutation.mutateAsync({ active_outlet, payload });
      toast.success('Payment recorded successfully');
      refetchPending();
      refetchCompleted();
      refetchConfirmed();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to record payment. Try again.';
      toast.error(msg);
    } finally {
      setPayingId(null);
    }
  };

  const handleOrdersPlaced = () => {
    refetchPending();
    setActiveTab('pending');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const isLoading =
    activeTab === 'pending' ? loadingPending :
    activeTab === 'completed' ? loadingCompleted :
    loadingConfirmed;

  const currentOrders =
    activeTab === 'pending' ? pendingOrders :
    activeTab === 'completed' ? completedOrders :
    confirmedOrders;

  const currentPages =
    activeTab === 'pending' ? pendingPages :
    activeTab === 'completed' ? completedPages :
    confirmedPages;

  const currentTotal =
    activeTab === 'pending' ? pendingTotal :
    activeTab === 'completed' ? completedTotal :
    confirmedTotal;

  const currentPage =
    activeTab === 'pending' ? pendingPage :
    activeTab === 'completed' ? completedPage :
    confirmedPage;

  const setCurrentPage =
    activeTab === 'pending' ? setPendingPage :
    activeTab === 'completed' ? setCompletedPage :
    setConfirmedPage;

  return (
    <div className="order-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="waiters-page-title">My Orders</h1>
        <button className="add-vendor-btn" onClick={() => setShowOrderModal(true)}>
          <Plus size={16} />
          New Order
        </button>
      </div>

      {/* Tabs */}
      <div className="stock-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          <Hourglass size={15} />
          Pending 
          {pendingTotal > 0 && (
            <span className="pending-tab-badge">{pendingTotal}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => handleTabChange('confirmed')}
        >
          <CheckCircle size={15} />
          Confirmed
          {confirmedTotal > 0 && (
            <span className="tab-count">{confirmedTotal}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => handleTabChange('completed')}
        >
          <CheckCircle size={15} />
          Completed
          {completedTotal > 0 && (
            <span className="tab-count">{completedTotal}</span>
          )}
        </button>
      </div>

      {/* Order cards */}
      <div className="waiter-cards-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : currentOrders.length === 0 ? (
          <div className="waiter-empty-wrap">
            <EmptyState
              title={
                activeTab === 'pending'
                  ? 'No pending orders'
                  : activeTab === 'completed'
                    ? 'No completed orders'
                    : 'No confirmed orders'
              }
            />
          </div>
        ) : (
          currentOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              outlet={active_outlet}
              onMarkPaid={handleMarkPaid}
              isPaying={payingId === order.id}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && currentOrders.length > 0 && currentPages > 1 && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          totalPages={currentPages}
          onPageChange={setCurrentPage}
          totalItems={currentTotal}
          showInfo={true}
          name="Orders"
        />
      )}

      {/* Place Order Modal */}
      <PlaceOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onOrdersPlaced={handleOrdersPlaced}
      />
    </div>
  );
};

export default WaitersPage;
