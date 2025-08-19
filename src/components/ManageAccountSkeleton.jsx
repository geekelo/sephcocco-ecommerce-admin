import React from 'react';
import '../styles/ManageAccountsSkeleton.css';

const ManageAccountsSkeleton = () => {
  return (
    <div className="manage-accounts-skeleton">
      {/* Stats Grid Skeleton */}
      <div className="stats-grid-skeleton">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="stat-card-skeleton">
            <div className="stat-icon-skeleton"></div>
            <div className="stat-content-skeleton">
              <div className="skeleton-line stat-number"></div>
              <div className="skeleton-line stat-label"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Header with Add Button Skeleton */}
      <div className="manage-accounts-header-skeleton">
        <div className="add-account-btn-skeleton">
          <div className="btn-icon-skeleton"></div>
          <div className="skeleton-line btn-text"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="accounts-tabs-skeleton">
        <div className="tab-list-skeleton">
          {[1, 2, 3].map((index) => (
            <div key={index} className={`tab-button-skeleton ${index === 1 ? 'active' : ''}`}>
              <div className="tab-icon-skeleton"></div>
              <div className="skeleton-line tab-text"></div>
              <div className="tab-count-skeleton"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter Controls Skeleton */}
      <div className="accounts-controls-skeleton">
        <div className="search-bar-skeleton">
          <div className="search-input-skeleton"></div>
          <div className="filter-section-skeleton">
            <div className="filter-btn-skeleton"></div>
            <div className="filter-dropdown-skeleton"></div>
          </div>
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="accounts-table-container-skeleton">
        <div className="table-skeleton">
          {/* Table Header */}
          <div className="table-header-skeleton">
            <div className="header-cell-skeleton user-header"></div>
            <div className="header-cell-skeleton phone-header"></div>
            <div className="header-cell-skeleton address-header"></div>
            <div className="header-cell-skeleton status-header"></div>
            <div className="header-cell-skeleton date-header"></div>
            <div className="header-cell-skeleton login-header"></div>
            <div className="header-cell-skeleton actions-header"></div>
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
            <div key={index} className="table-row-skeleton">
              {/* User/Avatar Cell */}
              <div className="table-cell-skeleton user-cell-skeleton">
                <div className="avatar-skeleton">
                  <div className="avatar-placeholder-skeleton"></div>
                  <div className="avatar-details-skeleton">
                    <div className="skeleton-line avatar-name"></div>
                    <div className="skeleton-line avatar-email"></div>
                  </div>
                </div>
              </div>

              {/* Phone Cell */}
              <div className="table-cell-skeleton phone-cell-skeleton">
                <div className="phone-icon-skeleton"></div>
                <div className="skeleton-line phone-text"></div>
              </div>

              {/* Address Cell */}
              <div className="table-cell-skeleton address-cell-skeleton">
                <div className="address-icon-skeleton"></div>
                <div className="skeleton-line address-text"></div>
              </div>

              {/* Status Cell */}
              <div className="table-cell-skeleton status-cell-skeleton">
                <div className="status-badge-skeleton"></div>
              </div>

              {/* Date Cell */}
              <div className="table-cell-skeleton date-cell-skeleton">
                <div className="date-icon-skeleton"></div>
                <div className="skeleton-line date-text"></div>
              </div>

              {/* Last Login Cell */}
              <div className="table-cell-skeleton login-cell-skeleton">
                <div className="skeleton-line login-text"></div>
              </div>

              {/* Actions Cell */}
              <div className="table-cell-skeleton actions-cell-skeleton">
                <div className="actions-menu-skeleton">
                  <div className="actions-dots-skeleton"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageAccountsSkeleton;