
import React from 'react';
import { X, User, Mail, MapPin, Phone, MessageCircle, Shield } from 'lucide-react';
import '../styles/AdminModal.css';

export default function AdminModal({ isOpen, onClose, adminData }) {
  if (!isOpen || !adminData) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay-admin')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay-admin" onClick={handleOverlayClick}>
      <div className="admin-modal-content">
        {/* Header */}
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Admin Details</h2>
          <button 
            className="admin-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="admin-modal-body">
          {/* Profile Section */}
          <div className="admin-profile-section">
            <div className="admin-avatar">
              <User size={32} />
            </div>
            <div className="admin-basic-info">
              <h3 className="admin-name">{adminData.name}</h3>
              <div className="admin-role">
                <Shield size={16} />
                <span>{adminData.role}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="admin-contact-section">
            <h4 className="section-title">Contact Information</h4>
            
            <div className="contact-item">
              <Mail size={18} />
              <div className="contact-details">
                <span className="contact-label">Email</span>
                <span className="contact-value">{adminData.email}</span>
              </div>
            </div>

            <div className="contact-item">
              <Phone size={18} />
              <div className="contact-details">
                <span className="contact-label">Phone Number</span>
                <span className="contact-value">{adminData.phone_number}</span>
              </div>
            </div>

            <div className="contact-item">
              <MessageCircle size={18} />
              <div className="contact-details">
                <span className="contact-label">WhatsApp</span>
                <span className="contact-value">{adminData.whatsapp_number}</span>
              </div>
            </div>

            <div className="contact-item">
              <MapPin size={18} />
              <div className="contact-details">
                <span className="contact-label">Address</span>
                <span className="contact-value">{adminData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="admin-modal-footer">
          <button className="admin-modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
}