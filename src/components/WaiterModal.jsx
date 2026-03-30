import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const SECTIONS = ['Section A', 'Section B', 'Section C', 'Section D', 'VIP Lounge', 'Outdoor'];

export const WaiterModal = ({ isOpen, onClose, waiter, onConfirm, isLoading, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    section: '',
    status: 'active',
  });

  useEffect(() => {
    if (isOpen && isEdit && waiter) {
      setFormData({
        name: waiter.name || '',
        email: waiter.email || '',
        phone: waiter.phone || '',
        section: waiter.section || '',
        status: waiter.status || 'active',
      });
    }
    if (!isEdit) {
      setFormData({ name: '', email: '', phone: '', section: '', status: 'active' });
    }
  }, [isOpen, isEdit, waiter]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    onConfirm(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-stock">
      <div className="stock-modal-stock">
        <div className="modal-header-stock">
          <h2>{isEdit ? 'Edit' : 'Add'} Waiter</h2>
          <button className="close-button-stock" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-content-stock">
          <div className="form-group-stock">
            <label>FULL NAME</label>
            <input
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="form-group-stock">
            <label>EMAIL</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div className="form-group-stock">
            <label>PHONE</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div className="form-group-stock">
            <label>ASSIGNED SECTION</label>
            <select
              value={formData.section}
              onChange={(e) => handleInputChange('section', e.target.value)}
            >
              <option value="">Select section</option>
              {SECTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group-stock">
            <label>STATUS</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="modal-actions-stock">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button className="confirm-btn" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
