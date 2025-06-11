import React from 'react';
import { Plus } from 'lucide-react';
 export const EmptyState = ({title, btnText, handleAddCategory,searchTerm,isLoading}) => (
    <div className="table-empty-state">
      <div className="empty-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <h3>{title}</h3>
      <p>
        {searchTerm 
          ? `No match "${searchTerm}". Try adjusting your search.`
          : "Add your first item to get started."
        }
      </p>
      {!searchTerm && (
        <button 
          className="add-category-btn"
          onClick={handleAddCategory}
          disabled={isLoading}
        >
          <Plus size={16} />
        { btnText}
        </button>
      )}
    </div>
  );