import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Minus, Search, CheckCircle, Hourglass, ShoppingCart, X, Package, ClipboardList, ScanBarcode, ChevronDown, Trash2, RotateCcw } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { toast } from 'react-toastify';
import FlexibleTable from '../components/FlexibleTable';
import Pagination from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';
import OutletSwitcher from '../components/OutletSwitcher';
import { useViewAllProduct } from '../hooks/useGetAllProduct';
import { useViewProductCategories } from '../hooks/useGetProductCategories';
import { useAdminOrderCreation } from '../hooks/useAdminOrderCreation';
import { useGetPendingWaiterOrders } from '../hooks/useGetPendingWaiterOrders';
import { useGetCompletedWaiterOrders } from '../hooks/useGetCompletedWaiterOrders';
import { useGetConfirmedWaiterOrders } from '../hooks/useGetConfirmedWaiterOrders';
import { useCreateWaiterPayment } from '../hooks/useCreateWaiterPayment';
import { useDiscardWaiterOrder } from '../hooks/useDiscardWaiterOrder';
import { useRefundWaiterOrder } from '../hooks/useRefundWaiterOrder';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/WaiterDashboard.css';

const ORDERS_PER_PAGE = 10;
const PRODUCTS_PER_PAGE = 10;

const fmt     = (val) => `₦${parseFloat(val || 0).toLocaleString()}`;
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '';
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const getOrderItems = (order, outlet) => {
  const key   = `sephcocco_${outlet}_order_items`;
  const items = order?.[key] || order?.order_items || order?.items;
  if (Array.isArray(items) && items.length > 0) {
    return items.map(item => {
      const pk   = `sephcocco_${outlet}_product`;
      const name = item?.[pk]?.name || item?.product?.name || item?.product_name || item?.name || 'Item';
      const qty  = item?.quantity || item?.qty || 1;
      return { name, qty };
    });
  }
  const name = order?.product?.name || order?.product_details?.name || 'Item';
  const qty  = order?.quantity || order?.qty || 1;
  return [{ name, qty }];
};

const getTableLabel = (order) => order?.address || order?.table_number || 'N/A';

// ── Group flat orders array by order_number ───────────────────────────────
const groupOrders = (orders, outlet) => {
  const map = {};
  orders.forEach(order => {
    const key = order.order_number || String(order.id);
    if (!map[key]) {
      map[key] = {
        order_number: key,
        table:        getTableLabel(order),
        created_at:   order.created_at,
        status:       order.status,
        allItems:     [],
        total:        0,
        orders:       [],
      };
    }
    map[key].allItems.push(...getOrderItems(order, outlet));
    map[key].total += parseFloat(order.total_cost || order.amount || 0);
    map[key].orders.push(order);
  });
  return Object.values(map).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
};

// ── Grouped orders list — shared for desktop + mobile ────────────────────
const GroupedOrdersList = ({
  groups, status, onMarkPaid, payingIds, expandedGroups, onToggle, isLoading,
  onDiscard, onRefund, discardingIds, refundingIds,
}) => {
  if (isLoading) {
    return (
      <div className="wd-group-list">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="wd-group-card wd-group-skeleton">
            <div className="skel w60" />
            <div className="skel w40 mt6" />
            <div className="skel w30 mt6" />
          </div>
        ))}
      </div>
    );
  }

  if (!groups.length) {
    return <EmptyState title={`No ${status} orders`} />;
  }

  return (
    <div className="wd-group-list">
      {groups.map(group => {
        const isExpanded   = expandedGroups.has(group.order_number);
        const isGroupPaying = group.orders.some(o => payingIds.has(o.id));
        const isPending    = status === 'pending';

        return (
          <div key={group.order_number} className={`wd-group-card wd-group-${status}`}>
            {/* ── Summary row ── */}
            <div className="wd-group-header" onClick={() => onToggle(group.order_number)}>
              <div className="wd-group-left">
                <span className="wd-table-badge">{group.table}</span>
                <div className="wd-group-meta-text">
                  <span className="wd-group-num">#{group.order_number}</span>
                  <span className="wd-group-count">
                    {group.allItems.length} item{group.allItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="wd-group-right">
                <div className="wd-group-info">
                  <span className="wd-order-total">{fmt(group.total)}</span>
                  <span className="wd-time">
                    {fmtDate(group.created_at)} · {fmtTime(group.created_at)}
                  </span>
                </div>

                <div className="wd-group-actions" onClick={e => e.stopPropagation()}>
                  {isPending ? (
                    <button
                      className="wd-paid-btn"
                      onClick={() => onMarkPaid(group.orders)}
                      disabled={isGroupPaying}
                    >
                      {isGroupPaying
                        ? 'Processing…'
                        : <><CheckCircle size={13} /> I Have Paid</>}
                    </button>
                  ) : (
                    <span className="wd-completed-badge">
                      <CheckCircle size={12} />
                      {status === 'confirmed' ? 'Confirmed' : 'Paid'}
                    </span>
                  )}
                </div>

                <ChevronDown size={16} className={`wd-chevron${isExpanded ? ' open' : ''}`} />
              </div>
            </div>

            {/* ── Item list (expanded) ── */}
            {isExpanded && (
              <div className="wd-group-items">
                <div className="wd-group-items-header">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                  <span></span>
                </div>
                {group.allItems.map((item, i) => {
                  const order       = group.orders[i];
                  const isDiscarding = discardingIds.has(order?.id);
                  const isRefunding  = refundingIds.has(order?.id);
                  return (
                    <div key={i} className="wd-group-item">
                      <span className="wd-group-item-name">{item.name}</span>
                      <span className="wd-group-item-qty">× {item.qty}</span>
                      <span className="wd-group-item-unit">{fmt(item.unit_price)}</span>
                      <span className="wd-group-item-total">{fmt(item.total_cost)}</span>
                      <div className="wd-group-item-actions">
                        {status === 'pending' && (
                          <button
                            className="wd-item-btn discard"
                            title="Discard"
                            disabled={isDiscarding}
                            onClick={e => { e.stopPropagation(); onDiscard(order); }}
                          >
                            {isDiscarding ? '…' : <Trash2 size={13} />}
                          </button>
                        )}
                        {status === 'confirmed' && (
                          <button
                            className="wd-item-btn refund"
                            title="Refund"
                            disabled={isRefunding}
                            onClick={e => { e.stopPropagation(); onRefund(order); }}
                          >
                            {isRefunding ? '…' : <RotateCcw size={13} />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Barcode scanner ───────────────────────────────────────────────────────
const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef    = useRef(null);
  const controlsRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current,
      (result, err) => {
        if (result) { controlsRef.current?.stop(); onScan(result.getText()); }
        if (err && !(err instanceof NotFoundException)) {
          setError('Camera access denied. Please allow camera permission and try again.');
        }
      }
    ).then(controls => {
      controlsRef.current = controls;
    }).catch(() => {
      setError('Could not start camera. Please allow camera access and try again.');
    });
    return () => { controlsRef.current?.stop(); };
  }, []);

  return (
    <div className="wd-scanner-overlay" onClick={onClose}>
      <div className="wd-scanner-modal" onClick={e => e.stopPropagation()}>
        <div className="wd-scanner-header">
          <span>Scan Barcode</span>
          <button className="wd-scanner-close" onClick={onClose}><X size={20} /></button>
        </div>
        {error ? (
          <div className="wd-scanner-error">{error}</div>
        ) : (
          <div className="wd-scanner-view">
            <video ref={videoRef} className="wd-scanner-video" muted playsInline />
            <div className="wd-scanner-frame"><div className="wd-scanner-line" /></div>
            <p className="wd-scanner-hint">Point at a barcode to scan automatically</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Mobile product card ───────────────────────────────────────────────────
const MobileProductCard = ({ product, qty, onAdd, onRemove }) => {
  const unit  = parseFloat(product?.price || product?.selling_price || 0);
  const total = unit * qty;
  return (
    <div className={`wd-mob-card ${qty > 0 ? 'in-cart' : ''}`}>
      <div className="wd-mob-card-info">
        <span className="wd-mob-name">{product.name}</span>
        <span className="wd-mob-unit">{fmt(unit)} / unit</span>
      </div>
      <div className="wd-mob-card-right">
        {qty > 0 && <span className="wd-mob-total">{fmt(total)}</span>}
        <div className="wd-qty-wrap">
          {qty > 0 ? (
            <>
              <button className="wd-qty-btn minus" onClick={() => onRemove(product)}><Minus size={13} /></button>
              <span className="wd-qty-val">{qty}</span>
              <button className="wd-qty-btn plus" onClick={() => onAdd(product)}><Plus size={13} /></button>
            </>
          ) : (
            <button className="wd-qty-btn add" onClick={() => onAdd(product)}><Plus size={13} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Cart content (shared between panel and sheet) ─────────────────────────
const CartContent = ({
  cartItems, total, tableNumber, setTableNumber, notes, setNotes,
  onAdd, onRemove, onPlace, isPlacing, onClose,
}) => (
  <div className="wd-cart-inner">
    <div className="wd-cart-items">
      {cartItems.length === 0 ? (
        <p className="wd-cart-empty">No items yet</p>
      ) : (
        cartItems.map(item => {
          const unit = parseFloat(item?.price || item?.selling_price || 0);
          return (
            <div key={item.id} className="wd-cart-row">
              <div className="wd-cart-info">
                <span className="wd-cart-name">{item.name}</span>
                <span className="wd-cart-sub">{fmt(unit)} each</span>
              </div>
              <div className="wd-cart-ctrl">
                <button className="wd-qty-btn minus sm" onClick={() => onRemove(item)}><Minus size={11} /></button>
                <span className="wd-qty-val sm">{item.qty}</span>
                <button className="wd-qty-btn plus sm" onClick={() => onAdd(item)}><Plus size={11} /></button>
              </div>
              <span className="wd-cart-line-total">{fmt(unit * item.qty)}</span>
            </div>
          );
        })
      )}
    </div>

    <div className="wd-cart-total-row">
      <span>Total</span>
      <span className="wd-cart-grand">{fmt(total)}</span>
    </div>

    <div className="wd-cart-fields">
      <label className="wd-field-label">TABLE NUMBER *</label>
      <input
        type="text"
        className="wd-field-input"
        placeholder="e.g. Table 5, VIP-1"
        value={tableNumber}
        onChange={e => setTableNumber(e.target.value)}
      />
      <label className="wd-field-label" style={{ marginTop: 10 }}>NOTES (OPTIONAL)</label>
      <textarea
        className="wd-field-input"
        rows={2}
        placeholder="Special requests, allergies..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
    </div>

    <div className="wd-cart-actions">
      {onClose && (
        <button className="wd-cancel-btn" onClick={onClose} disabled={isPlacing}>Cancel</button>
      )}
      <button
        className="wd-place-btn"
        onClick={onPlace}
        disabled={isPlacing || cartItems.length === 0 || !tableNumber.trim()}
      >
        {isPlacing ? 'Placing...' : 'Place Order'}
      </button>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────
const WaiterDashboard = () => {
  const active_outlet = getActiveOutlet();

  const [cart, setCart]                     = useState({});
  const [categoryId, setCategoryId]         = useState('');
  const [searchTerm, setSearchTerm]         = useState('');
  const [debSearch, setDebSearch]           = useState('');
  const [tableNumber, setTableNumber]       = useState('');
  const [notes, setNotes]                   = useState('');
  const [showCartSheet, setShowCartSheet]   = useState(false);
  const [showScanner, setShowScanner]       = useState(false);
  const [dateRange, setDateRange]           = useState({ start_date: '', end_date: '' });
  const [completedFilters, setCompletedFilters] = useState({ start_date: '', end_date: '' });
  const [orderTab, setOrderTab]             = useState('pending');
  const [pendingPage, setPendingPage]       = useState(1);
  const [completedPage, setCompletedPage]   = useState(1);
  const [confirmedPage, setConfirmedPage]   = useState(1);
  const [payingIds, setPayingIds]           = useState(new Set());
  const [productPage, setProductPage]       = useState(1);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [discardingIds, setDiscardingIds]   = useState(new Set());
  const [refundingIds, setRefundingIds]     = useState(new Set());

  const [searchParams, setSearchParams] = useSearchParams();
  const pageTab    = searchParams.get('tab') || 'products';
  const setPageTab = (tab) => setSearchParams({ tab });

  const orderMutation   = useAdminOrderCreation();
  const paymentMutation = useCreateWaiterPayment();
  const discardMutation = useDiscardWaiterOrder();
  const refundMutation  = useRefundWaiterOrder();

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: productData, isLoading: loadingProducts } = useViewAllProduct(
    active_outlet, null,
    { search_terms: debSearch, category_id: categoryId || undefined },
    productPage, PRODUCTS_PER_PAGE
  );
  const { data: catData } = useViewProductCategories(active_outlet);

  const { data: pendingData,   isLoading: loadingPending,   refetch: refetchPending   } =
    useGetPendingWaiterOrders(active_outlet, pendingPage, ORDERS_PER_PAGE);
  const { data: completedData, isLoading: loadingCompleted, refetch: refetchCompleted } =
    useGetCompletedWaiterOrders(active_outlet, completedPage, ORDERS_PER_PAGE, completedFilters);
  const { data: confirmedData, isLoading: loadingConfirmed, refetch: refetchConfirmed } =
    useGetConfirmedWaiterOrders(active_outlet, confirmedPage, ORDERS_PER_PAGE, completedFilters);

  const products     = productData?.products || productData?.data || [];
  const productMeta  = productData?.meta || {};
  const productTotal = productMeta?.total_count ?? products.length;
  const productPages = productMeta?.total_pages  ?? Math.ceil(productTotal / PRODUCTS_PER_PAGE);
  const categories   = Array.isArray(catData) ? catData : (catData?.product_categories || catData?.categories || catData?.data || []);

  const pendingOrders   = pendingData?.orders?.grouped_orders   || pendingData?.orders   || pendingData?.data   || [];
  const completedOrders = completedData?.orders?.grouped_orders || completedData?.orders || completedData?.data || [];
  const confirmedOrders = confirmedData?.orders?.grouped_orders || confirmedData?.orders || confirmedData?.data || [];
console.log({PENDINDATA: pendingData});

  const pendingMeta    = pendingData?.meta   || {};
  const completedMeta  = completedData?.meta || {};
  const confirmedMeta  = confirmedData?.meta || {};
  const pendingTotal   = pendingMeta?.total_count   ?? pendingOrders.length;
  const completedTotal = completedMeta?.total_count ?? completedOrders.length;
  const confirmedTotal = confirmedMeta?.total_count ?? confirmedOrders.length;
  const pendingPages   = pendingMeta?.total_pages   ?? Math.ceil(pendingTotal / ORDERS_PER_PAGE);
  const completedPages = completedMeta?.total_pages ?? Math.ceil(completedTotal / ORDERS_PER_PAGE);
  const confirmedPages = confirmedMeta?.total_pages ?? Math.ceil(confirmedTotal / ORDERS_PER_PAGE);
  // ── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, qty: (prev[product.id]?.qty || 0) + 1 },
    }));
  }, []);

  const removeFromCart = useCallback((product) => {
    setCart(prev => {
      const qty = prev[product.id]?.qty || 0;
      if (qty <= 1) { const next = { ...prev }; delete next[product.id]; return next; }
      return { ...prev, [product.id]: { ...prev[product.id], qty: qty - 1 } };
    });
  }, []);

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + parseFloat(i.price || i.selling_price || 0) * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!tableNumber.trim()) { toast.error('Enter a table number'); return; }
    if (cartItems.length === 0) { toast.error('Add at least one item'); return; }
    try {
      const payload = {
        [`sephcocco_${active_outlet}_order`]: {
          products: cartItems.map(item => ({
            [`sephcocco_${active_outlet}_product_id`]: item.id,
            quantity: item.qty,
          })),
          address:          tableNumber.trim(),
          additional_notes: notes,
        },
      };
      await orderMutation.mutateAsync({ active_outlet, payload });
      toast.success(`Order placed for ${tableNumber}`);
      setCart({});
      setTableNumber('');
      setNotes('');
      setShowCartSheet(false);
      refetchPending();
      setPageTab('orders');
      setOrderTab('pending');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    }
  };

  // ── Mark as paid (accepts single order or array of orders) ───────────────
  const handleMarkPaid = useCallback(async (orderOrOrders) => {
    const orderArr = Array.isArray(orderOrOrders) ? orderOrOrders : [orderOrOrders];
    const ids      = orderArr.map(o => o.id);
    const total    = orderArr.reduce((s, o) => s + parseFloat(o.total_cost || o.amount || 0), 0);

    setPayingIds(prev => new Set([...prev, ...ids]));
    try {
      const payload = {
        [`sephcocco_${active_outlet}_payment`]: {
          orders_ids:     ids,
          amount:         total,
          payment_method: 'bank',
          transaction_id: `WAI-${Date.now()}`,
        },
      };
      await paymentMutation.mutateAsync({ active_outlet, payload });
      toast.success('Payment recorded');
      refetchPending();
      refetchCompleted();
      refetchConfirmed();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    } finally {
      setPayingIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
    }
  }, [active_outlet, paymentMutation, refetchPending, refetchCompleted, refetchConfirmed]);

  // ── Toggle expanded group ────────────────────────────────────────────────
  const toggleGroup = useCallback((key) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // ── Discard / Refund order item ──────────────────────────────────────────
  const handleDiscard = useCallback(async (order) => {
    const ids = [order.id];
    setDiscardingIds(prev => new Set([...prev, order.id]));
    try {
      await discardMutation.mutateAsync({ active_outlet, orderIds: ids });
      toast.success('Order discarded');
      refetchPending(); refetchCompleted(); refetchConfirmed();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to discard order');
    } finally {
      setDiscardingIds(prev => { const n = new Set(prev); n.delete(order.id); return n; });
    }
  }, [active_outlet, discardMutation, refetchPending, refetchCompleted, refetchConfirmed]);

  const handleRefund = useCallback(async (order) => {
    const ids = [order.id];
    setRefundingIds(prev => new Set([...prev, order.id]));
    try {
      await refundMutation.mutateAsync({ active_outlet, orderIds: ids });
      toast.success('Order refunded');
      refetchPending(); refetchCompleted(); refetchConfirmed();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to refund order');
    } finally {
      setRefundingIds(prev => { const n = new Set(prev); n.delete(order.id); return n; });
    }
  }, [active_outlet, refundMutation, refetchPending, refetchCompleted, refetchConfirmed]);

  // ── Desktop product columns ───────────────────────────────────────────────
  const productColumns = useMemo(() => [
    {
      key: 'product', header: 'Product', flex: 3,
      render: (p) => (
        <div className="wd-product-cell">
          <span className="wd-product-name">{p.name}</span>
        </div>
      ),
    },
    {
      key: 'unit_price', header: 'Unit Price', flex: 2,
      render: (p) => <span className="wd-unit-price">{fmt(p.price || p.selling_price)}</span>,
    },
    {
      key: 'qty', header: 'Qty', flex: 2,
      render: (p) => {
        const qty = cart[p.id]?.qty || 0;
        return (
          <div className="wd-qty-wrap" onClick={e => e.stopPropagation()}>
            {qty > 0 ? (
              <>
                <button className="wd-qty-btn minus" onClick={() => removeFromCart(p)}><Minus size={12} /></button>
                <span className="wd-qty-val">{qty}</span>
                <button className="wd-qty-btn plus" onClick={() => addToCart(p)}><Plus size={12} /></button>
              </>
            ) : (
              <button className="wd-qty-btn add" onClick={() => addToCart(p)}><Plus size={12} /></button>
            )}
          </div>
        );
      },
    },
    {
      key: 'total', header: 'Total', flex: 2,
      render: (p) => {
        const qty  = cart[p.id]?.qty || 0;
        const unit = parseFloat(p.price || p.selling_price || 0);
        return qty > 0
          ? <span className="wd-row-total active">{fmt(unit * qty)}</span>
          : <span className="wd-row-total">—</span>;
      },
    },
  ], [cart, addToCart, removeFromCart]);

  const isPlacing = orderMutation.isPending;

  // ── Current tab data ─────────────────────────────────────────────────────
  const currentOrders =
    orderTab === 'pending'   ? pendingOrders :
    orderTab === 'completed' ? completedOrders : confirmedOrders;

  const loadingOrders =
    orderTab === 'pending'   ? loadingPending :
    orderTab === 'completed' ? loadingCompleted : loadingConfirmed;

  const currentPages =
    orderTab === 'pending'   ? pendingPages :
    orderTab === 'completed' ? completedPages : confirmedPages;

  const currentTotal =
    orderTab === 'pending'   ? pendingTotal :
    orderTab === 'completed' ? completedTotal : confirmedTotal;

  const currentPage =
    orderTab === 'pending'   ? pendingPage :
    orderTab === 'completed' ? completedPage : confirmedPage;

  const setCurrentPage =
    orderTab === 'pending'   ? setPendingPage :
    orderTab === 'completed' ? setCompletedPage : setConfirmedPage;

  const groupedOrders = useMemo(() => {
    return currentOrders.map(group => {
      const individualOrders = Array.isArray(group.orders) ? group.orders : [];
      const first = individualOrders[0] || {};
      return {
        order_number: group.order_number,
        table:        first.address || first.table_number || '—',
        created_at:   first.created_at || '',
        status:       first.status || group.payment_status,
        allItems:     individualOrders.map(o => ({
          name:       o.product?.name || o.product_details?.name || 'Item',
          qty:        o.quantity || 1,
          unit_price: parseFloat(o.unit_price || o.product?.price || 0),
          total_cost: parseFloat(o.total_cost || o.total_price || 0),
        })),
        total:  parseFloat(group.total_price || 0),
        orders: individualOrders,
      };
    });
  }, [currentOrders]);

  return (
    <div className="wd-page">

      {/* ── Page header tabs ────────────────────────────────────────── */}
      <div className="wd-page-header">
        <div className="wd-page-tabs">
          <button
            className={`wd-page-tab ${pageTab === 'products' ? 'active' : ''}`}
            onClick={() => setPageTab('products')}
          >
            <Package size={16} /> Products
          </button>
          <button
            className={`wd-page-tab ${pageTab === 'orders' ? 'active' : ''}`}
            onClick={() => setPageTab('orders')}
          >
            <ClipboardList size={16} /> Orders
            {pendingTotal > 0 && <span className="wd-page-tab-badge">{pendingTotal}</span>}
          </button>
        </div>
        <OutletSwitcher className="wd-outlet-switcher" />
      </div>

      {/* ── Products + Cart ─────────────────────────────────────────── */}
      <div className={`wd-top ${pageTab !== 'products' ? 'wd-hidden' : ''}`}>

        {/* Left: Product browser */}
        <div className="wd-browser">
          <div className="wd-filters-row">
            <div className="wd-cat-dropdown-wrap">
              <select
                className="wd-cat-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="wd-search-wrap">
              <Search size={15} className="wd-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="wd-search-clear" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <button className="wd-scan-btn" onClick={() => setShowScanner(true)} title="Scan barcode">
              <ScanBarcode size={18} />
            </button>
          </div>

          {showScanner && (
            <BarcodeScanner
              onScan={(value) => { setSearchTerm(value); setDebSearch(value); setShowScanner(false); }}
              onClose={() => setShowScanner(false)}
            />
          )}

          {/* Desktop: FlexibleTable */}
          <div className="wd-desktop-table">
            <FlexibleTable
              data={products}
              columns={productColumns}
              keyField="id"
              isLoading={loadingProducts}
              clickableRows={false}
              skeletonRows={8}
              emptyState={<EmptyState title="No products found" />}
            />
          </div>

          {/* Mobile: product cards */}
          <div className="wd-mobile-cards">
            {loadingProducts ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="wd-mob-card wd-mob-skeleton">
                  <div className="skel w60" />
                  <div className="skel w40 mt6" />
                </div>
              ))
            ) : products.length === 0 ? (
              <EmptyState title="No products found" />
            ) : (
              products.map(p => (
                <MobileProductCard
                  key={p.id}
                  product={p}
                  qty={cart[p.id]?.qty || 0}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {!loadingProducts && productPages > 1 && (
            <Pagination
              currentPage={productPage}
              itemsPerPage={PRODUCTS_PER_PAGE}
              totalPages={productPages}
              onPageChange={setProductPage}
              totalItems={productTotal}
              showInfo
              name="Products"
            />
          )}
        </div>

        {/* Desktop: Cart side panel */}
        <div className="wd-cart-panel">
          <div className="wd-cart-panel-header">
            <ShoppingCart size={17} />
            <span>Your Order</span>
            {cartCount > 0 && <span className="wd-cart-count">{cartCount}</span>}
          </div>
          <CartContent
            cartItems={cartItems}
            total={cartTotal}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            notes={notes}
            setNotes={setNotes}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onPlace={handlePlaceOrder}
            isPlacing={isPlacing}
          />
        </div>
      </div>

      {/* Mobile: sticky cart bar */}
      {cartCount > 0 && pageTab === 'products' && (
        <div className="wd-mobile-bar" onClick={() => setShowCartSheet(true)}>
          <span className="wd-bar-info">
            <ShoppingCart size={16} />
            {cartCount} item{cartCount !== 1 ? 's' : ''} · {fmt(cartTotal)}
          </span>
          <span className="wd-bar-cta">Place Order →</span>
        </div>
      )}

      {/* Mobile: cart bottom sheet */}
      {showCartSheet && (
        <div className="wd-sheet-overlay" onClick={() => setShowCartSheet(false)}>
          <div className="wd-sheet" onClick={e => e.stopPropagation()}>
            <div className="wd-sheet-head">
              <h3>Your Order</h3>
              <button className="wd-sheet-close" onClick={() => setShowCartSheet(false)}>
                <X size={20} />
              </button>
            </div>
            <CartContent
              cartItems={cartItems}
              total={cartTotal}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              notes={notes}
              setNotes={setNotes}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onPlace={handlePlaceOrder}
              isPlacing={isPlacing}
              onClose={() => setShowCartSheet(false)}
            />
          </div>
        </div>
      )}

      {/* ── My Orders section ──────────────────────────────────────── */}
      <div className={`wd-orders-section ${pageTab !== 'orders' ? 'wd-hidden' : ''}`}>
        <div className="wd-orders-header">
          <h2 className="wd-orders-title">My Orders</h2>
        </div>

        {/* Order tabs */}
        <div className="wd-order-tabs">
          <button
            className={`wd-tab ${orderTab === 'pending' ? 'active' : ''}`}
            onClick={() => setOrderTab('pending')}
          >
            <Hourglass size={14} /> Pending
            {pendingTotal > 0 && <span className="wd-tab-badge">{pendingTotal}</span>}
          </button>
          <button
            className={`wd-tab ${orderTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => setOrderTab('confirmed')}
          >
            <CheckCircle size={14} /> Confirmed
            {confirmedTotal > 0 && <span className="wd-tab-count">{confirmedTotal}</span>}
          </button>
          <button
            className={`wd-tab ${orderTab === 'completed' ? 'active' : ''}`}
            onClick={() => setOrderTab('completed')}
          >
            <CheckCircle size={14} /> Completed
            {completedTotal > 0 && <span className="wd-tab-count">{completedTotal}</span>}
          </button>
        </div>

        {/* Completed / Confirmed date filters */}
        {(orderTab === 'completed' || orderTab === 'confirmed') && (
          <div className="wd-date-filters">
            <div className="wd-date-field">
              <label className="wd-date-label">From</label>
              <input
                type="date"
                className="wd-date-input"
                value={dateRange.start_date}
                onChange={e => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="wd-date-field">
              <label className="wd-date-label">To</label>
              <input
                type="date"
                className="wd-date-input"
                value={dateRange.end_date}
                onChange={e => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <button
              className="wd-date-search-btn"
              onClick={() => { setCompletedFilters({ ...dateRange }); setCompletedPage(1); setConfirmedPage(1); }}
              disabled={!dateRange.end_date}
            >
              Search
            </button>
            {(completedFilters.start_date || completedFilters.end_date) && (
              <button
                className="wd-date-clear"
                onClick={() => {
                  setDateRange({ start_date: '', end_date: '' });
                  setCompletedFilters({ start_date: '', end_date: '' });
                  setCompletedPage(1);
                  setConfirmedPage(1);
                }}
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Grouped orders list */}
        <GroupedOrdersList
          groups={groupedOrders}
          status={orderTab}
          onMarkPaid={handleMarkPaid}
          payingIds={payingIds}
          expandedGroups={expandedGroups}
          onToggle={toggleGroup}
          isLoading={loadingOrders}
          onDiscard={handleDiscard}
          onRefund={handleRefund}
          discardingIds={discardingIds}
          refundingIds={refundingIds}
        />

        {!loadingOrders && currentPages > 1 && (
          <Pagination
            currentPage={currentPage}
            itemsPerPage={ORDERS_PER_PAGE}
            totalPages={currentPages}
            onPageChange={setCurrentPage}
            totalItems={currentTotal}
            showInfo
            name="Orders"
          />
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
