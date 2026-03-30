import { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { useViewAllProduct } from '../hooks/useGetAllProduct';
import { useViewProductCategories } from '../hooks/useGetProductCategories';
import { useCreateWaiterOrder } from '../hooks/useCreateWaiterOrder';
import { getActiveOutlet } from '../utils/getActiveOutlets';

const PlaceOrderModal = ({ isOpen, onClose, onOrdersPlaced }) => {
  const active_outlet = getActiveOutlet();

  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes]             = useState('');
  const [cart, setCart]               = useState({});
  const [categoryId, setCategoryId]   = useState('');
  const [searchTerm, setSearchTerm]   = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrderMutation = useCreateWaiterOrder();

  // ── API data ──────────────────────────────────────────────────────────────
  const { data: productData, isLoading: loadingProducts } = useViewAllProduct(
    active_outlet,
    null,
    { search_terms: searchTerm, category_id: categoryId || undefined },
    1,
    50
  );

  const { data: categoryData } = useViewProductCategories(active_outlet);

  const products   = productData?.products   || productData?.data   || [];
  const categories = categoryData?.product_categories || categoryData?.categories || categoryData?.data || [];

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTableNumber('');
      setNotes('');
      setCart({});
      setCategoryId('');
      setSearchTerm('');
      setShowSummary(false);
    }
  }, [isOpen]);

  // ── Cart helpers ──────────────────────────────────────────────────────────
  const getProductPrice = (p) => parseFloat(p?.price || p?.selling_price || 0);
  const getProductStock = (p) => p?.amount_in_stock ?? p?.stock ?? 999;

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: {
        ...product,
        qty: Math.min((prev[product.id]?.qty || 0) + 1, getProductStock(product)),
      },
    }));
  };

  const removeFromCart = (product) => {
    setCart(prev => {
      const current = prev[product.id]?.qty || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: { ...prev[product.id], qty: current - 1 } };
    });
  };

  const cartItems = Object.values(cart);
  const total     = cartItems.reduce((sum, i) => sum + getProductPrice(i) * i.qty, 0);

  // ── Submit: create one order per cart item ────────────────────────────────
  const handleSubmit = async () => {
    if (!tableNumber.trim()) { toast.error('Please enter a table number'); return; }
    if (cartItems.length === 0) { toast.error('Please add at least one item'); return; }

    setIsSubmitting(true);
    try {
      const results = [];
      for (const item of cartItems) {
        const payload = {
          [`sephcocco_${active_outlet}_order`]: {
            [`sephcocco_${active_outlet}_product_id`]: item.id,
            quantity: item.qty,
            address: tableNumber.trim(),
            additional_notes: notes,
          },
        };
        const res = await createOrderMutation.mutateAsync({ active_outlet, payload });
        results.push(res);
      }
      toast.success(`${cartItems.length} item${cartItems.length > 1 ? 's' : ''} ordered for ${tableNumber}`);
      onOrdersPlaced?.(results);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-stock">
      <div className="place-order-modal">

        {/* Header */}
        <div className="modal-header-stock">
          {showSummary && (
            <button className="po-back-btn" onClick={() => setShowSummary(false)}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h2>{showSummary ? 'Order Summary' : 'Create New Order'}</h2>
          <button className="close-button-stock" onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <div className="po-body">

          {/* ── LEFT: Product browser ─────────────────────────────────── */}
          <div className={`po-left ${showSummary ? 'po-hidden-mobile' : ''}`}>

            {/* Table number input */}
            <div className="form-group-stock">
              <label>TABLE NUMBER</label>
              <input
                type="text"
                placeholder="e.g. Table 5, VIP-1, 12"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Category + Search — compact, not full width */}
            <div className="po-filter-row">
              <select
                className="po-category-select"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">All</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="po-search-wrap">
                <Search size={15} className="po-search-icon" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Product list */}
            <div className="po-product-list">
              {loadingProducts ? (
                <div className="po-loading">
                  <Loader size={20} className="po-spinner" />
                  <span>Loading items...</span>
                </div>
              ) : products.length === 0 ? (
                <p className="po-empty-search">No items found</p>
              ) : (
                products.map(product => {
                  const qty   = cart[product.id]?.qty || 0;
                  const price = getProductPrice(product);
                  return (
                    <div key={product.id} className={`po-product-row ${qty > 0 ? 'in-cart' : ''}`}>
                      <div className="po-product-info">
                        <span className="po-product-name">{product.name}</span>
                        <span className="po-product-price">₦{price.toLocaleString()}</span>
                      </div>
                      <div className="po-qty-control">
                        {qty > 0 ? (
                          <>
                            <button className="po-qty-btn minus" onClick={() => removeFromCart(product)}>
                              <Minus size={13} />
                            </button>
                            <span className="po-qty-num">{qty}</span>
                            <button
                              className="po-qty-btn plus"
                              onClick={() => addToCart(product)}
                              disabled={qty >= getProductStock(product)}
                            >
                              <Plus size={13} />
                            </button>
                          </>
                        ) : (
                          <button className="po-qty-btn add" onClick={() => addToCart(product)}>
                            <Plus size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile: review button */}
            {cartItems.length > 0 && (
              <button className="po-review-btn" onClick={() => setShowSummary(true)}>
                Review · {cartItems.reduce((s, i) => s + i.qty, 0)} item{cartItems.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''} · ₦{total.toLocaleString()}
              </button>
            )}
          </div>

          {/* ── RIGHT: Order summary ──────────────────────────────────── */}
          <div className={`po-right ${!showSummary ? 'po-hidden-mobile' : ''}`}>

            <h3 className="po-summary-title">Order Summary</h3>

            {cartItems.length === 0 ? (
              <div className="po-empty-cart">No items added yet</div>
            ) : (
              <div className="po-cart-list">
                {cartItems.map(item => (
                  <div key={item.id} className="po-cart-row">
                    <div className="po-cart-info">
                      <span className="po-cart-name">{item.name}</span>
                      <span className="po-cart-sub">x{item.qty} · ₦{getProductPrice(item).toLocaleString()}</span>
                    </div>
                    <div className="po-cart-actions">
                      <button className="po-qty-btn minus sm" onClick={() => removeFromCart(item)}>
                        <Minus size={11} />
                      </button>
                      <span className="po-qty-num sm">{item.qty}</span>
                      <button
                        className="po-qty-btn plus sm"
                        onClick={() => addToCart(item)}
                        disabled={item.qty >= getProductStock(item)}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <span className="po-cart-total">₦{(getProductPrice(item) * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="po-total-row">
              <span>Total</span>
              <span className="po-total-amount">₦{total.toLocaleString()}</span>
            </div>

            {/* Table + Notes */}
            <div className="po-delivery-section">
              <div className="form-group-stock">
                <label>TABLE</label>
                <input
                  type="text"
                  value={tableNumber}
                  readOnly
                  placeholder="Enter table number on the left"
                  style={{ background: '#f9fafb', cursor: 'default' }}
                />
              </div>
              <div className="form-group-stock">
                <label>NOTES (OPTIONAL)</label>
                <textarea
                  rows={2}
                  placeholder="Special requests, allergies..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {!tableNumber.trim() && cartItems.length > 0 && (
              <div className="po-field-error">
                <AlertCircle size={12} /> Enter a table number to continue
              </div>
            )}

            <div className="modal-actions-stock" style={{ padding: 0, marginTop: 8 }}>
              <button className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleSubmit}
                disabled={isSubmitting || !tableNumber.trim() || cartItems.length === 0}
              >
                {isSubmitting
                  ? <><Loader size={14} className="po-spinner" /> Placing...</>
                  : 'Create Order'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
