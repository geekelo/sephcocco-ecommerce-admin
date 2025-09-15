import { X } from "lucide-react";
import { useEffect, useState } from "react";

// Stock Modal Component (for both Add and Update)
export const StockModal = ({ isOpen, onClose, product, stockData, onConfirm, isLoading, isEdit = false }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor: '',
    add_stock: '',
    cost_price: '',
    profit_markup: '',
    status: 'pending'
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && stockData) {
        setFormData({
          invoice_number: stockData.invoice_number || '',
          vendor: stockData.vendor || '',
          add_stock: stockData.stock?.add_stock || '',
          cost_price: stockData.price?.cost_price || '',
          profit_markup: stockData.price?.profit_markup || '',
          status: stockData.status || 'pending'
        });
      } else {
        setFormData({
          invoice_number: '',
          vendor: '',
          add_stock: '',
          cost_price: '',
          profit_markup: '',
          status: 'pending'
        });
      }
    }
  }, [isOpen, isEdit, stockData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateNewPrice = () => {
    const costPrice = parseFloat(formData.cost_price) || 0;
    const markup = parseFloat(formData.profit_markup) || 0;
    return costPrice * (1 + markup / 100);
  };

  const handleSubmit = () => {
    if (!formData.invoice_number || !formData.vendor || !formData.add_stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      sephcocco_product_id: product?.id || stockData?.sephcocco_product_id,
      invoice_number: formData.invoice_number,
      vendor: formData.vendor,
      status: formData.status || 'pending',
      stock: {
        add_stock: parseInt(formData.add_stock)
      },
      price: {
        cost_price: parseFloat(formData.cost_price) || 0,
        profit_markup: parseFloat(formData.profit_markup) || 0
      }
    };
    onConfirm(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-stock">
      <div className="stock-modal-stock">
        <div className="modal-header-stock">
          <h2>{isEdit ? 'Update' : 'Add'} Stock - {product?.name || stockData?.product?.name}</h2>
          <button className="close-button-stock" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content-stock">
          <div className="form-group-stock">
            <label>Invoice Number *</label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) => handleInputChange('invoice_number', e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
          
          <div className="form-group-stock">
            <label>Vendor Name*</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => handleInputChange('vendor', e.target.value)}
              placeholder="Enter vendor name"
            />
          </div>

          {isEdit && (
            <div className="form-group-stock">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select-stock"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          
          <div className="form-row-stock">
            <div className="form-group-stock">
              <label>Current Stock</label>
              <input
                type="number"
                value={product?.amount_in_stock}
                disabled
                className="disabled-input"
              />
            </div>
            
            <div className="form-group-stock">
              <label>{isEdit ? 'Stock Quantity' : 'Add Stock'} *</label>
              <input
                type="number"
                value={formData.add_stock}
                onChange={(e) => handleInputChange('add_stock', e.target.value)}
                placeholder={isEdit ? 'Enter stock quantity' : 'Enter quantity to add'}
              />
            </div>
          </div>
          
          <div className="form-row-stock">
            <div className="form-group-stock">
              <label>Cost Price (₦)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => handleInputChange('cost_price', e.target.value)}
                placeholder="Enter cost price"
              />
            </div>
            
            <div className="form-group-stock">
              <label>Profit Markup (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.profit_markup}
                onChange={(e) => handleInputChange('profit_markup', e.target.value)}
                placeholder="Enter markup percentage"
              />
            </div>
          </div>
          
          {formData.cost_price && formData.profit_markup && (
            <div className="price-preview">
              <strong>New Selling Price: ₦{calculateNewPrice().toLocaleString()}</strong>
            </div>
          )}
        </div>
        
        <div className="modal-actions-stock">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleSubmit}
            disabled={!formData.invoice_number || !formData.vendor || !formData.add_stock || isLoading}
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Stock' : 'Add Stock')}
          </button>
        </div>
      </div>
    </div>
  );
};
