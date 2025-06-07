import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import '../styles/CategoryTableRow.css';

const CategoryTableRow = ({ 
  order: category, 
  columns, 
  onCategoryAction,
  isLoading = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleActionClick = (action) => {
    setShowDropdown(false);
    onCategoryAction(action, category);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderCellContent = (column) => {
    const value = category[column.id];
    
    switch (column.id) {
      case 'actions':
        return (
          <div className="actions-cell" ref={dropdownRef}>
            <button
              className="hamburger-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isLoading}
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => handleActionClick('view')}
                  disabled={isLoading}
                >
                  <Eye size={14} />
                  <span>View</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleActionClick('edit')}
                  disabled={isLoading}
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  className="dropdown-item delete"
                  onClick={() => handleActionClick('delete')}
                  disabled={isLoading}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        );
      
      case 'dateCreated':
      case 'dateModified':
        return formatDate(value);
      
      case 'productCount':
        return (
          <span className={`product-count ${value > 0 ? 'has-products' : 'no-products'}`}>
            {value || 0}
          </span>
        );
      
      case 'description':
        return (
          <div className="description-cell" title={value}>
            {value && value.length > 50 ? `${value.substring(0, 50)}...` : value || 'N/A'}
          </div>
        );
      
      case 'name':
        return (
          <div className="category-name" title={value}>
            {value || 'Unnamed Category'}
          </div>
        );
      
      default:
        return value || 'N/A';
    }
  };

  return (
    <div className={`order-row category-row ${isLoading ? 'loading' : ''}`}>
      {columns.map(column => (
        <div
          key={column.id}
          className={`order-cell ${column.className || ''}`}
        >
          {renderCellContent(column)}
        </div>
      ))}
    </div>
  );
};

export default CategoryTableRow;