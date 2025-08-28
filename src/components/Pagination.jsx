import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import '../styles/Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  name,
  onPageChange,
  showInfo = true,
  className = ''
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  // Calculate the range of items being shown
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
console.log('curdddp',itemsPerPage);

  const handlePageClick = (page) => {
    if (page !== currentPage && page !== '...' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className={`pagination-container ${className}`}>
      {showInfo && (
        <div className="pagination-info">
          <span className="pagination-text">
            Showing {startItem}-{endItem} of {totalItems} {name}
          </span>
        </div>
      )}
      
      <nav className="pagination-nav" aria-label="Pagination">
        <div className="pagination-buttons">
          {/* Previous button */}
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button pagination-prev"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
            <span className="pagination-button-text">Previous</span>
          </button>

          {/* Page numbers */}
          <div className="pagination-numbers">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="pagination-ellipsis">
                    <MoreHorizontal size={16} />
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageClick(page)}
                    className={`pagination-number ${
                      page === currentPage ? 'active' : ''
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button pagination-next"
            aria-label="Next page"
          >
            <span className="pagination-button-text">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Pagination;