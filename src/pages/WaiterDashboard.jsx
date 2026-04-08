import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Minus, Search, CheckCircle, Hourglass, ShoppingCart, X, Package, ClipboardList, ScanBarcode } from 'lucide-react';
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
import { useCreateWaiterPayment } from '../hooks/useCreateWaiterPayment';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import '../styles/WaiterDashboard.css';

const ORDERS_PER_PAGE = 10;
const PRODUCTS_PER_PAGE = 10;

const fmt = (val) => `₦${parseFloat(val || 0).toLocaleString()}`;
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const getOrderItems = (order, outlet) => {
  // Try nested items array first
  const key = `sephcocco_${outlet}_order_items`;
  const items = order?.[key] || order?.order_items || order?.items;
  if (Array.isArray(items) && items.length > 0) {
    return items.map(item => {
      const pk  = `sephcocco_${outlet}_product`;
      const name = item?.[pk]?.name || item?.product?.name || item?.product_name || item?.name || 'Item';
      const qty  = item?.quantity || item?.qty || 1;
      return { name, qty };
    });
  }
  // Flat order: product + quantity directly on the order object
  const name = order?.product?.name || order?.product_details?.name || 'Item';
  const qty  = order?.quantity || order?.qty || 1;
  return [{ name, qty }];
};

// ── Mobile pending order card ─────────────────────────────────────────────
const MobilePendingOrderCard = ({ order, outlet, onMarkPaid, isPaying }) => {
  const items = getOrderItems(order, outlet);
  return (
    <div className="wd-mob-order-card pending">
      <div className="wd-mob-order-top">
        <span className="wd-table-badge">{order.address || order.table_number || '—'}</span>
        <span className="wd-time">{fmtTime(order.created_at)}</span>
      </div>
      {items.length > 0 && (
        <div className="wd-items-wrap" style={{ margin: '6px 0' }}>
          {items.map((it, i) => (
            <span key={i} className="wd-item-tag">{it.name} ×{it.qty}</span>
          ))}
        </div>
      )}
      <div className="wd-mob-order-bottom">
        <span className="wd-order-total">{fmt(order.total_cost || order.amount)}</span>
        <button
          className="wd-paid-btn"
          onClick={() => onMarkPaid(order)}
          disabled={isPaying}
        >
          {isPaying ? 'Processing...' : <><CheckCircle size={13} /> I Have Paid</>}
        </button>
      </div>
    </div>
  );
};

// ── Mobile completed order card ───────────────────────────────────────────
const MobileCompletedOrderCard = ({ order, outlet }) => {
  const items = getOrderItems(order, outlet);
  return (
    <div className="wd-mob-order-card completed">
      <div className="wd-mob-order-top">
        <span className="wd-table-badge">{order.address || order.table_number || '—'}</span>
        <span className="wd-time">{fmtTime(order.created_at)}</span>
      </div>
      {items.length > 0 && (
        <div className="wd-items-wrap" style={{ margin: '6px 0' }}>
          {items.map((it, i) => (
            <span key={i} className="wd-item-tag completed">{it.name} ×{it.qty}</span>
          ))}
        </div>
      )}
      <div className="wd-mob-order-bottom">
        <span className="wd-order-total">{fmt(order.total_cost || order.amount)}</span>
        <span className="wd-completed-badge"><CheckCircle size={12} /> Paid</span>
      </div>
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
        if (result) {
          controlsRef.current?.stop();
          onScan(result.getText());
        }
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
            <div className="wd-scanner-frame">
              <div className="wd-scanner-line" />
            </div>
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

  const [cart, setCart]               = useState({});
  const [categoryId, setCategoryId]   = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [debSearch, setDebSearch]     = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes]             = useState('');
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showScanner, setShowScanner]     = useState(false);
  const [dateRange, setDateRange]               = useState({ start_date: '', end_date: '' });
  const [completedFilters, setCompletedFilters] = useState({ start_date: '', end_date: '' });
  const [orderTab, setOrderTab]       = useState('pending');
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [payingId, setPayingId]       = useState(null);
  const [productPage, setProductPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageTab = searchParams.get('tab') || 'products';
  const setPageTab = (tab) => setSearchParams({ tab });

  const orderMutation   = useAdminOrderCreation();
  const paymentMutation = useCreateWaiterPayment();

  // Debounce search
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

  const {
    data: pendingData, isLoading: loadingPending, refetch: refetchPending,
  } = useGetPendingWaiterOrders(active_outlet, pendingPage, ORDERS_PER_PAGE);
console.log({Pen: pendingData});

  const {
    data: completedData, isLoading: loadingCompleted, refetch: refetchCompleted,
  } = useGetCompletedWaiterOrders(active_outlet, completedPage, ORDERS_PER_PAGE, completedFilters);
console.log({dd: completedData});

  const products      = productData?.products   || productData?.data   || [];
  const productMeta   = productData?.meta || {};
  const productTotal  = productMeta?.total_count ?? products.length;
  const productPages  = productMeta?.total_pages  ?? Math.ceil(productTotal / PRODUCTS_PER_PAGE);
  const categories    = Array.isArray(catData) ? catData : (catData?.product_categories || catData?.categories || catData?.data || []);
  const pendingOrders = pendingData?.orders   || pendingData?.data   || [];
  const completedOrders = completedData?.orders || completedData?.data || [];

  const pendingMeta   = pendingData?.meta   || {};
  const completedMeta = completedData?.meta || {};
  const pendingTotal  = pendingMeta?.total_count  ?? pendingOrders.length;
  const completedTotal= completedMeta?.total_count?? completedOrders.length;
  const pendingPages  = pendingMeta?.total_pages  ?? Math.ceil(pendingTotal / ORDERS_PER_PAGE);
  const completedPages= completedMeta?.total_pages?? Math.ceil(completedTotal / ORDERS_PER_PAGE);

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
      if (qty <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
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
          address: tableNumber.trim(),
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

  // ── Mark as paid ─────────────────────────────────────────────────────────
  const handleMarkPaid = useCallback(async (order) => {
    setPayingId(order.id);
    try {
      const payload = {
        [`sephcocco_${active_outlet}_payment`]: {
          orders_ids: [order.id],
          amount: parseFloat(order.total_cost || order.amount || 0),
          payment_method: 'bank',
          transaction_id: `WAI-${Date.now()}`,
        },
      };
      await paymentMutation.mutateAsync({ active_outlet, payload });
      toast.success('Payment recorded');
      refetchPending();
      refetchCompleted();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  }, [active_outlet, paymentMutation, refetchPending, refetchCompleted]);

  // ── Desktop product columns ───────────────────────────────────────────────
  const productColumns = useMemo(() => [
    {
      key: 'product',
      header: 'Product',
      flex: 3,
      render: (p) => (
        <div className="wd-product-cell">
          <span className="wd-product-name">{p.name}</span>
        </div>
      ),
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      flex: 2,
      render: (p) => (
        <span className="wd-unit-price">{fmt(p.price || p.selling_price)}</span>
      ),
    },
    {
      key: 'qty',
      header: 'Qty',
      flex: 2,
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
      key: 'total',
      header: 'Total',
      flex: 2,
      render: (p) => {
        const qty  = cart[p.id]?.qty || 0;
        const unit = parseFloat(p.price || p.selling_price || 0);
        return qty > 0
          ? <span className="wd-row-total active">{fmt(unit * qty)}</span>
          : <span className="wd-row-total">—</span>;
      },
    },
  ], [cart, addToCart, removeFromCart]);

  // ── Pending order columns ────────────────────────────────────────────────
  const pendingColumns = useMemo(() => [
    {
      key: 'address',
      header: 'Table',
      flex: 1,
      render: (o) => <span className="wd-table-badge">{o.address || o.table_number || '—'}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      flex: 4,
      render: (o) => {
        const items = getOrderItems(o, active_outlet);
        if (!items.length) return <span className="wd-no-items">—</span>;
        return (
          <div className="wd-items-wrap">
            {items.map((it, i) => (
              <span key={i} className="wd-item-tag">{it.name} ×{it.qty}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'total_cost',
      header: 'Total',
      flex: 1.5,
      render: (o) => <span className="wd-order-total">{fmt(o.total_cost || o.amount)}</span>,
    },
    {
      key: 'created_at',
      header: 'Time',
      flex: 1,
      render: (o) => <span className="wd-time">{fmtTime(o.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      flex: 2,
      render: (o) => (
        <button
          className="wd-paid-btn"
          onClick={(e) => { e.stopPropagation(); handleMarkPaid(o); }}
          disabled={payingId === o.id}
        >
          {payingId === o.id
            ? 'Processing...'
            : <><CheckCircle size={13} /> I Have Paid</>
          }
        </button>
      ),
    },
  ], [payingId, handleMarkPaid, active_outlet]);

  const completedColumns = useMemo(() => [
    {
      key: 'address',
      header: 'Table',
      flex: 1,
      render: (o) => <span className="wd-table-badge">{o.address || o.table_number || '—'}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      flex: 4,
      render: (o) => {
        const items = getOrderItems(o, active_outlet);
        if (!items.length) return <span className="wd-no-items">—</span>;
        return (
          <div className="wd-items-wrap">
            {items.map((it, i) => (
              <span key={i} className="wd-item-tag completed">{it.name} ×{it.qty}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'total_cost',
      header: 'Total',
      flex: 1.5,
      render: (o) => <span className="wd-order-total">{fmt(o.total_cost || o.amount)}</span>,
    },
    {
      key: 'created_at',
      header: 'Time',
      flex: 1,
      render: (o) => <span className="wd-time">{fmtTime(o.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      flex: 2,
      render: () => (
        <span className="wd-completed-badge"><CheckCircle size={12} /> Paid</span>
      ),
    },
  ], [active_outlet]);

  const isPlacing = orderMutation.isPending;

  const currentOrders  = orderTab === 'pending' ? pendingOrders    : completedOrders;
  const currentCols    = orderTab === 'pending' ? pendingColumns    : completedColumns;
  const loadingOrders  = orderTab === 'pending' ? loadingPending   : loadingCompleted;
  const currentPages   = orderTab === 'pending' ? pendingPages     : completedPages;
  const currentTotal   = orderTab === 'pending' ? pendingTotal     : completedTotal;
  const currentPage    = orderTab === 'pending' ? pendingPage      : completedPage;
  const setCurrentPage = orderTab === 'pending' ? setPendingPage   : setCompletedPage;

  return (
    <div className="wd-page">

      {/* ── Page header tabs ────────────────────────────────────────── */}
      <div className="wd-page-header">
        <div className="wd-page-tabs">
          <button
            className={`wd-page-tab ${pageTab === 'products' ? 'active' : ''}`}
            onClick={() => setPageTab('products')}
          >
            <Package size={16} />
            Products
          </button>
          <button
            className={`wd-page-tab ${pageTab === 'orders' ? 'active' : ''}`}
            onClick={() => setPageTab('orders')}
          >
            <ClipboardList size={16} />
            Orders
            {pendingTotal > 0 && <span className="wd-page-tab-badge">{pendingTotal}</span>}
          </button>
        </div>
        <OutletSwitcher className="wd-outlet-switcher" />
      </div>

      {/* ── Products + Cart ─────────────────────────────────────────── */}
      <div className={`wd-top ${pageTab !== 'products' ? 'wd-hidden' : ''}`}>

        {/* Left: Product browser */}
        <div className="wd-browser">

          {/* Category + Search row */}
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

          {/* ── Desktop: FlexibleTable ─────────────────────────────── */}
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

          {/* ── Mobile: product cards ──────────────────────────────── */}
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

        {/* ── Desktop: Cart side panel ───────────────────────────────── */}
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

      {/* ── Mobile: sticky cart bar ─────────────────────────────────── */}
      {cartCount > 0 && pageTab === 'products' && (
        <div className="wd-mobile-bar" onClick={() => setShowCartSheet(true)}>
          <span className="wd-bar-info">
            <ShoppingCart size={16} />
            {cartCount} item{cartCount !== 1 ? 's' : ''} · {fmt(cartTotal)}
          </span>
          <span className="wd-bar-cta">Place Order →</span>
        </div>
      )}

      {/* ── Mobile: cart bottom sheet ───────────────────────────────── */}
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
            <Hourglass size={14} />
            Pending
            {pendingTotal > 0 && <span className="wd-tab-badge">{pendingTotal}</span>}
          </button>
          <button
            className={`wd-tab ${orderTab === 'completed' ? 'active' : ''}`}
            onClick={() => setOrderTab('completed')}
          >
            <CheckCircle size={14} />
            Completed
            {completedTotal > 0 && <span className="wd-tab-count">{completedTotal}</span>}
          </button>
        </div>

        {/* Completed date filters */}
        {orderTab === 'completed' && (
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
              onClick={() => { setCompletedFilters({ ...dateRange }); setCompletedPage(1); }}
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
                }}
              >
                <X size={13} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Orders table — desktop */}
        <div className="wd-orders-table wd-desktop-only">
          <FlexibleTable
            data={currentOrders}
            columns={currentCols}
            keyField="id"
            isLoading={loadingOrders}
            clickableRows={false}
            skeletonRows={5}
         
            emptyState={
              <EmptyState
                title={orderTab === 'pending' ? 'No pending orders' : 'No completed orders'}
              />
            }
          />
        </div>

        {/* Orders cards — mobile */}
        <div className="wd-mob-orders wd-mobile-only">
          {loadingOrders ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="wd-mob-order-card">
                <div className="skel w40" />
                <div className="skel w60 mt6" />
                <div className="skel w30 mt6" />
              </div>
            ))
          ) : currentOrders.length === 0 ? (
            <EmptyState title={orderTab === 'pending' ? 'No pending orders' : 'No completed orders'} />
          ) : orderTab === 'pending' ? (
            currentOrders.map(o => (
              <MobilePendingOrderCard
                key={o.id}
                order={o}
                outlet={active_outlet}
                onMarkPaid={handleMarkPaid}
                isPaying={payingId === o.id}
              />
            ))
          ) : (
            currentOrders.map(o => (
              <MobileCompletedOrderCard
                key={o.id}
                order={o}
                outlet={active_outlet}
              />
            ))
          )}
        </div>

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
