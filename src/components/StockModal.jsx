import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getActiveOutlet } from "../utils/getActiveOutlets";
import { toast } from 'react-toastify';
import VendorDropdown from './VendorDropdown'; // ✅ Import the new component

// Stock Modal Component (for both Add and Update)
export const StockModal = ({ 
  isOpen, 
  onClose, 
  product, 
  stockData, 
  onConfirm, 
  isLoading, 
  isEdit = false,
  vendors = [] 
}) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    vendor: '', 
    add_stock: '',
    cost_price: '',
    profit_markup: '',
    status: 'pending'
  });
  
  const activeOutlet = getActiveOutlet();

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && stockData) {
  
        const vendorId = vendors.find(v => v.name === stockData.vendor)?.id || '';
        
        setFormData({
          invoice_number: stockData.invoice_number || '',
          vendor: vendorId,
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
  }, [isOpen, isEdit, stockData, vendors]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateNewPrice = () => {
    const costPrice = parseFloat(formData.cost_price) || 0;
    const markup = parseFloat(formData.profit_markup) || 0;
    return costPrice + markup;
  };

  const handleSubmit = () => {
    if (!formData.invoice_number || !formData.vendor || !formData.add_stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    // ✅ Get vendor name from selected vendor ID
    const selectedVendor = vendors.find(v => v.id === formData.vendor);
    
    const payload = {
      [`sephcocco_${activeOutlet}_product_id`]: product?.id || stockData?.product?.id,
      invoice_number: formData.invoice_number,
      vendor: selectedVendor?.id || '',
      status: formData.status || 'pending',
      stock: {
        add_stock: parseInt(formData.add_stock, 10) || 0
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
          
          {/* ✅ UPDATED: Use VendorDropdown instead of text input */}
          <div className="form-group-stock">
            <label>Vendor Name *</label>
            <VendorDropdown
              vendors={vendors}
              value={formData.vendor}
              onChange={(vendorId) => handleInputChange('vendor', vendorId)}
              placeholder="Select vendor"
              disabled={isLoading}
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
                value={product?.amount_in_stock || stockData?.product?.amount_in_stock || 0}
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
              <label>Old Price</label>
              <input
                type="number"
                value={product?.price || stockData?.product?.price || 0}
                disabled
                className="disabled-input"
              />
            </div>
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
              <label>Profit Markup</label>
              <input
                type="number"
                step="0.01"
                value={formData.profit_markup}
                onChange={(e) => handleInputChange('profit_markup', e.target.value)}
                placeholder="Enter profit markup"
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