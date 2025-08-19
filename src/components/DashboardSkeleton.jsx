import React from 'react';
import '../styles/DashboardSkeleton.css';

const DashboardSkeleton = () => {
  return (
    <div className="dashboard dashboard-loading">
      {/* Dashboard Header Skeleton */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>
        <div className="dashboard-controls">
          <div className="skeleton skeleton-outlet-switcher"></div>
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div className="stats-row">
        {[1, 2, 3].map((index) => (
          <div key={index} className="stats-card-skeleton">
            <div className="skeleton skeleton-stats-title"></div>
            <div className="skeleton skeleton-stats-value"></div>
            <div className="skeleton skeleton-stats-chart"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="main-content">
        {/* Performance Chart Skeleton */}
        <div className="chart-section">
          <div className="section-header">
            <div className="skeleton skeleton-section-title"></div>
          </div>
          <div className="chart-container performance-chart-container">
            <div className="skeleton skeleton-chart"></div>
          </div>
        </div>

        {/* Chat Sidebar Skeleton */}
        <div className="chat-sidebar">
          <div className="section-header">
            <div className="skeleton skeleton-section-title-small"></div>
            <div className="skeleton skeleton-see-all"></div>
          </div>
          <div className="chat-list">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="chat-item-skeleton">
                <div className="skeleton skeleton-avatar"></div>
                <div className="chat-content-skeleton">
                  <div className="skeleton skeleton-chat-name"></div>
                  <div className="skeleton skeleton-chat-message"></div>
                  <div className="skeleton skeleton-chat-time"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section Skeleton */}
      <div className="products-section">
        <div className="section-header product">
          <div className="skeleton skeleton-section-title"></div>
        </div>
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="product-card-skeleton">
              <div className="skeleton skeleton-product-image"></div>
              <div className="product-info-skeleton">
                <div className="skeleton skeleton-product-name"></div>
                <div className="skeleton skeleton-product-price"></div>
                <div className="skeleton skeleton-product-category"></div>
                <div className="skeleton skeleton-product-buttons"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;