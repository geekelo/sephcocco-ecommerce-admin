import React from 'react';
import '../styles/ShippingSkeleton.css';

const ShippingSkeleton = () => {
  return (
    <div className="shipping-skeleton">
      {/* Header Skeleton */}
      <div className="shipping-header-skeleton">
        <div className="header-content-skeleton">
          <div className="skeleton-line title-skeleton"></div>
          <div className="skeleton-line subtitle-skeleton"></div>
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="search-bar-section-skeleton">
        <div className="search-container-skeleton">
          <div className="search-input-skeleton"></div>
          <div className="filter-controls-skeleton">
            <div className="filter-dropdown-skeleton"></div>
            <div className="date-inputs-skeleton">
              <div className="date-input-skeleton"></div>
              <div className="date-input-skeleton"></div>
            </div>
            <div className="apply-button-skeleton"></div>
          </div>
        </div>
      </div>

      {/* Rider Statistics Skeleton */}
      <div className="rider-stats-skeleton">
        <div className="stats-header-skeleton">
          <div className="skeleton-line stats-title"></div>
        </div>
        <div className="stats-grid-skeleton">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="stat-card-skeleton">
              <div className="stat-icon-skeleton"></div>
              <div className="stat-content-skeleton">
                <div className="skeleton-line stat-value"></div>
                <div className="skeleton-line stat-label"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="table-container-skeleton">
        <div className="table-skeleton">
          {/* Table Header */}
          <div className="table-header-skeleton">
            <div className="header-cell-skeleton tracking-header"></div>
            <div className="header-cell-skeleton status-header"></div>
            <div className="header-cell-skeleton customer-header"></div>
            <div className="header-cell-skeleton order-header"></div>
            <div className="header-cell-skeleton amount-header"></div>
            <div className="header-cell-skeleton rider-header"></div>
            <div className="header-cell-skeleton date-header"></div>
            <div className="header-cell-skeleton action-header"></div>
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <div key={index} className="table-row-skeleton">
              {/* Tracking Number Cell */}
              <div className="table-cell-skeleton tracking-cell-skeleton">
                <div className="skeleton-line tracking-number"></div>
              </div>

              {/* Status Cell */}
              <div className="table-cell-skeleton status-cell-skeleton">
                <div className="status-badge-skeleton"></div>
              </div>

              {/* Customer Cell */}
              <div className="table-cell-skeleton customer-cell-skeleton">
                <div className="customer-info-skeleton">
                  <div className="skeleton-line customer-name"></div>
                  <div className="skeleton-line customer-phone"></div>
                </div>
              </div>

              {/* Order ID Cell */}
              <div className="table-cell-skeleton order-cell-skeleton">
                <div className="skeleton-line order-id"></div>
              </div>

              {/* Amount Cell */}
              <div className="table-cell-skeleton amount-cell-skeleton">
                <div className="skeleton-line amount-value"></div>
              </div>

              {/* Rider Cell */}
              <div className="table-cell-skeleton rider-cell-skeleton">
                <div className="rider-dropdown-skeleton">
                  <div className="skeleton-line rider-name"></div>
                  <div className="dropdown-arrow-skeleton"></div>
                </div>
              </div>

              {/* Date Cell */}
              <div className="table-cell-skeleton date-cell-skeleton">
                <div className="skeleton-line date-value"></div>
              </div>

              {/* Action Cell */}
              <div className="table-cell-skeleton action-cell-skeleton">
                <div className="view-button-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="pagination-skeleton">
        <div className="pagination-info-skeleton">
          <div className="skeleton-line pagination-text"></div>
        </div>
        <div className="pagination-controls-skeleton">
          <div className="pagination-button-skeleton"></div>
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="pagination-number-skeleton"></div>
          ))}
          <div className="pagination-button-skeleton"></div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSkeleton;