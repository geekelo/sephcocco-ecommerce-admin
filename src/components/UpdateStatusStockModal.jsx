import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../styles/UpdateOrderStatusModal.css';
import { getActiveOutlet } from '../utils/getActiveOutlets';
import { useUpdateStock } from '../hooks/useUpdateStock';
import { useUpdateBulkStock } from '../hooks/useUpdateBulkStock';
import { toast } from 'react-toastify';


const UpdateStockStatusModal = ({
  isOpen,
  onClose,
  selectedStockHistory,
  selectedStockIds = [],
  product,
  formData,
  refetchStock,
  onSuccess
}) => {
  const activeOutlet = getActiveOutlet();
  const { mutateAsync: updateStock, isPending: updatingStock } = useUpdateStock();
  const { mutateAsync: updateBulkStock, isPending: updatingBulkStock } = useUpdateBulkStock();

  const [selectedStatus, setSelectedStatus] = useState(formData?.status || 'pending');

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#FF9800', icon: '●' },
    { value: 'approved', label: 'Approved', color: '#4CAF50', icon: '●' },
    { value: 'declined', label: 'Declined', color: '#F44336', icon: '●' },
  ];

  const handleConfirm = async () => {
    try {
      if (selectedStockIds.length > 0) {
        // Bulk Update
        const payload = {
          stock_management_ids: selectedStockIds,
          status: selectedStatus
        };
console.log({BUP: payload});

      const res =  await updateBulkStock({
          active_outlet: activeOutlet,
          payload
        });
console.log({BUDD: res});

        toast.success(`${selectedStockIds.length} stock items updated successfully`);
      } else {
        // Single Update
        const payload = {
          [`sephcocco_${activeOutlet}_product_id`]: product?.id,
          invoice_number: formData.invoice_number,
          vendor: formData.vendor,
          status: selectedStatus,

        };

        await updateStock({
          active_outlet: activeOutlet,
          stockId: selectedStockHistory?.id,
          payload,
        });

        toast.success('Stock updated successfully');
      }

      onClose();
      refetchStock?.();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  if (!isOpen) return null;

  const isBulk = selectedStockIds.length > 0;
  const isLoading = updatingStock || updatingBulkStock;

  return (
    <div className="modal-overlay-confirm">
      <div className="update-status-modal">
        {/* Header */}
        <div className="modal-header-confirm">
          <div className="logo-container-confirm">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>
          <button
            type="button"
            className="close-button-confirm"
            onClick={onClose}
          >
            <X size={24} color="#000" />
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          <h2 className="update-status-title">
            {isBulk ? `Update Status (${selectedStockIds.length} items)` : 'Update Stock Status'}
          </h2>
          <p className="update-status-description">
            Select the status you want to set for {isBulk ? 'these stock items' : 'this stock update'}
          </p>

          <div className="status-options">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`status-option ${selectedStatus === option.value ? 'selected' : ''
                  }`}
              >
                <input
                  type="radio"
                  name="stockStatus"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                <span
                  className="status-indicator"
                  style={{ color: option.color }}
                >
                  {option.icon}
                </span>
                <span className="status-text">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions-order">
          <button
            type="button"
            className="confirm-button update-status-button"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStockStatusModal;
