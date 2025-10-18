import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import '../styles/VendorDropdown.css';

const VendorDropdown = ({ 
  vendors = [], 
  value, 
  onChange, 
  placeholder = "Select vendor",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter vendors based on search term
  const filteredVendors = vendors.filter(vendor => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(search) ||
      vendor.email?.toLowerCase().includes(search) ||
      vendor.phone?.toLowerCase().includes(search)
    );
  });

  // Find selected vendor
  const selectedVendor = vendors.find(v => v.id === value);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (vendorId) => {
    onChange(vendorId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="vendor-dropdown-wrapper" ref={dropdownRef}>
      <div 
        className={`vendor-dropdown-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
      >
        <span className="vendor-dropdown-value">
          {selectedVendor ? selectedVendor.name : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`vendor-dropdown-icon ${isOpen ? 'rotated' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="vendor-dropdown-menu">
          {/* Search Box */}
          <div className="vendor-search-container">
            {/* <Search size={16} className="vendor-search-icon" /> */}
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vendor-search-input"
              autoFocus
            />
          </div>

          {/* Vendor List */}
          <div className="vendor-list-container">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`vendor-list-item ${vendor.id === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(vendor.id)}
                >
                  <div className="vendor-item-content">
                    <div className="vendor-item-name">{vendor.name}</div>
                  </div>
                  {vendor.id === value && (
                    <div className="vendor-item-check">✓</div>
                  )}
                </div>
              ))
            ) : (
              <div className="vendor-list-empty">
                <p>No vendors found</p>
                {searchTerm && (
                  <small>Try adjusting your search</small>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDropdown;