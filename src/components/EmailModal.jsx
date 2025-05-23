import { X } from "lucide-react";
import { useState } from "react";
import  '../styles/EmailModal.css';
 const EmailModal = ({ isOpen, onClose, customerName, customerEmail }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSendEmail = () => {
    // Here you would typically integrate with your email service
    console.log('Sending email to:', customerEmail);
    console.log('Subject:', subject);
    console.log('Description:', description);
    
    // Reset form and close modal
    setSubject('');
    setDescription('');
    onClose();
    
    // Show success message (you could add a toast notification here)
    alert('Email sent successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirm">
      <div className="confirm-action-modal email-modal">
        <div className="modal-header-confirm">
          <h2>Send Email</h2>
          <button className="close-button-confirm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="email-modal-content">
          <div className="customer-info">
            <p><strong>To:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
          </div>
          
          <div className="email-form">
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="email-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter email message"
                rows="5"
                className="email-textarea"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              className="confirm-button"
              onClick={handleSendEmail}
              disabled={!subject.trim() || !description.trim()}
            >
              Send Email
            </button>
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal