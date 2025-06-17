import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import '../styles/Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  totalItems = 0, 
  itemsPerPage = 20,
  showInfo = true,
  maxVisiblePages = 7 
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate start and end pages around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust start page if we're near the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && page !== '...' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      {showInfo && (
        <div className="pagination-info">
          <span>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
      )}
      
      <div className="pagination-controls">
        <button
          className={`pagination-btn pagination-prev ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="pagination-pages">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              className={`pagination-page ${
                page === currentPage ? 'active' : ''
              } ${page === '...' ? 'ellipsis' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
              aria-label={page === '...' ? 'More pages' : `Go to page ${page}`}
            >
              {page === '...' ? <MoreHorizontal size={16} /> : page}
            </button>
          ))}
        </div>

        <button
          className={`pagination-btn pagination-next ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;