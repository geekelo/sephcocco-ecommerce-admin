import React from 'react';
import { ArrowLeft, Edit, Trash2, Package, Calendar, Receipt } from 'lucide-react';
import ProductCard from './ProductCard';
import '../styles/OrderSummary.css';
import InfoCard from './InfoCard';
import { formatDate } from '../utils/formatDate';

const StockSummary = ({
  stockData,
  onBack,
  onEdit,
  onDelete,
  onUpdateStatus, 

  isUpdating = false,
  hideEmailButton = true
}) => {
  console.log('stock data', stockData);
  
  // Format stock data for display
  const formatStockData = (stock) => {
    return {
      invoiceNumber: stock.invoice_number,
      stockId: stock.id,
      vendor: stock.vendor || 'N/A',
      status: stock.status,
      createdDate: stock.created_at,
      updatedDate: stock.updated_at,
      product: stock.product,
      stockChanges: stock.stock,
      priceChanges: stock.price,
      notes: stock.notes || null
    };
  };

  const {
    invoiceNumber,
    stockId,
    vendor,
    status,
    createdDate,
    updatedDate,
    product,
    stockChanges,
    priceChanges,
    notes
  } = formatStockData(stockData);

  // Format product for ProductCard component
  const formattedProduct = product ? [{
    id: product.id,
    name: product.name,
    image: product.main_image_url,
    price: priceChanges?.new_price || product.price,
    rating: 5,
    stockCount: stockChanges?.new_stock || product.amount_in_stock,
    stockStatus: product.out_of_stock_status ? "Out of stock" : "In stock",
    description: product.short_description || product.long_description,
    categories: product.categories?.map(cat => cat.name).join(', ') || 'No category',
    barcode: product.barcode
  }] : [];

  // Left card - Stock Transaction Details
  const leftCardItems = [
    { label: "Invoice Number:", value: invoiceNumber || 'N/A', isCopyable: true },
    { label: "Stock ID:", value: stockId || 'N/A', isCopyable: true },
    { label: "Vendor Name:", value: vendor },
    { label: "Transaction Date:", value: createdDate ? formatDate(createdDate) : 'N/A' },
    { label: "Status:", value: status || 'N/A', badge: true }
  ];

  // Right card - Stock Changes & Pricing
  const rightCardItems = [
    { label: "Previous Stock:", value: stockChanges?.old_stock?.toString() || '0' },
    { label: "Stock Added:", value: `+${stockChanges?.add_stock || 0}`, highlight: true },
    { label: "New Stock Total:", value: stockChanges?.new_stock?.toString() || '0', highlight: true },
    { label: "Previous Price:", value: priceChanges?.old_price ? `₦${parseFloat(priceChanges.old_price).toLocaleString()}` : 'N/A' },
    { label: "New Price:", value: priceChanges?.new_price ? `₦${parseFloat(priceChanges.new_price).toLocaleString()}` : 'N/A', highlight: true },
    ...(updatedDate && updatedDate !== createdDate ? [{ label: "Last Updated:", value: formatDate(updatedDate) }] : [])
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="modal-overlay-order-summary">
      <div className="add-product-modal">
        <div className="modal-header">
          <h2>Stock Management Summary</h2>
          <div className="header-actions">
            <button className="back-button" onClick={onBack}>
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
                        
        <div className='verify'>
          <button 
            className="update-button add-button" 
            onClick={onEdit}
            disabled={isUpdating}
            style={{ 
              opacity: isUpdating ? 0.6 : 1,
              cursor: isUpdating ? 'not-allowed' : 'pointer'
            }}
          >
            <Edit size={16} />
            {isUpdating ? 'Updating...' : 'Edit Stock Record'}  
          </button>
        </div>
                        
        <div className="order-details">
          <div className="order-info-row">
            <InfoCard items={leftCardItems} />
            <InfoCard items={rightCardItems} />
          </div>

          {/* Stock Changes Summary */}
          <div className="ordered-products-section">
            <h3>Stock Transaction Summary</h3>
            <div className="stock-summary-grid">
              <div className="stock-change-card">
                <div className="stock-change-header">
                  <Package size={20} />
                  <span>Stock Movement</span>
                </div>
                <div className="stock-change-details">
                  <div className="stock-change-item">
                    <span className="label">Previous Stock:</span>
                    <span className="value old-stock">{stockChanges?.old_stock || 0}</span>
                  </div>
                  <div className="stock-change-item">
                    <span className="label">Added:</span>
                    <span className="value add-stock">+{stockChanges?.add_stock || 0}</span>
                  </div>
                  <div className="stock-change-item total">
                    <span className="label">New Total:</span>
                    <span className="value new-stock">{stockChanges?.new_stock || 0}</span>
                  </div>
                </div>
              </div>

              <div className="stock-change-card">
                <div className="stock-change-header">
                  <Receipt size={20} />
                  <span>Price Update</span>
                </div>
                <div className="stock-change-details">
                  <div className="stock-change-item">
                    <span className="label">Previous Price:</span>
                    <span className="value">
                      {priceChanges?.old_price ? `₦${parseFloat(priceChanges.old_price).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="stock-change-item total">
                    <span className="label">New Price:</span>
                    <span className="value new-price">
                      {priceChanges?.new_price ? `₦${parseFloat(priceChanges.new_price).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information */}
          {formattedProduct.length > 0 && (
            <div className="ordered-products-section">
              <h3>Product Information</h3>
              <div className="ordered-products-grid">
                {formattedProduct.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    showVisible={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {notes && (
            <div className="ordered-products-section">
              <h3>Notes</h3>
              <div className="notes-section">
                <p>{notes}</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              className="update-button add-button" 
              onClick={onUpdateStatus}
              disabled={isUpdating}
            >
             
              Update Stock Status
            </button>
          
            <button 
              className="discard-button cancel-button" 
              onClick={onDelete}
              disabled={isUpdating}
            >
           
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSummary;