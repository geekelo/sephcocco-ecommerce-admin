import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const VendorModal = ({ isOpen, onClose, vendor, onConfirm, isLoading, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    bank_details: ''
  });

  useEffect(() => {
    if (isOpen && isEdit && vendor) setFormData(vendor);
    if (!isEdit) setFormData({
      name: '', email: '', phone: '', address: '', city: '', state: '', country: '', bank_details: ''
    });
  }, [isOpen, isEdit, vendor]);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }
    onConfirm(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-stock">
      <div className="stock-modal-stock">
        <div className="modal-header-stock">
          <h2>{isEdit ? 'Edit' : 'Add'} Vendor</h2>
          <button className="close-button-stock" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-content-stock">
          {['name','email','phone','address','city','state','country','bank_details'].map(field => (
            <div className="form-group-stock" key={field}>
              <label>{field.replace('_',' ').toUpperCase()}</label>
              <input
                type="text"
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="modal-actions-stock">
          <button className="cancel-btn" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button  className="confirm-btn" onClick={handleSubmit} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};
