import React from 'react';
import '../styles/AnalyticsSkeleton.css';

const AnalyticsSkeleton = () => {
  return (
    <div className="analytics-skeleton">
      {/* Analytics Header Skeleton */}
      <div className="analytics-header-skeleton">
        <div className="analytics-title-skeleton">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-subtitle"></div>
        </div>
        <div className="analytics-controls-skeleton">
          <div className="skeleton-outlet-switcher"></div>
        </div>
      </div>

      {/* Overview Stats Skeleton */}
      <div className="overview-stats-skeleton">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="stat-card-skeleton">
            <div className="stat-header-skeleton">
              <div className="skeleton-line stat-title"></div>
              <div className="stat-icon-skeleton"></div>
            </div>
            <div className="skeleton-line stat-value-skeleton"></div>
            <div className="skeleton-line stat-trend-skeleton"></div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="charts-section-skeleton">
        {/* Orders Trend Skeleton */}
        <div className="chart-card-skeleton">
          <div className="chart-header-skeleton">
            <div className="skeleton-line chart-title"></div>
            <div className="timeframe-selector-skeleton">
              <div className="skeleton-btn"></div>
              <div className="skeleton-btn"></div>
            </div>
          </div>
          <div className="chart-container-skeleton">
            <div className="skeleton-chart area-chart">
              {/* Simulating area chart with gradient */}
              <div className="chart-grid">
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <div key={index} className="chart-bar area-bar" style={{
                    height: `${30 + Math.random() * 70}%`,
                    animationDelay: `${index * 0.1}s`
                  }}></div>
                ))}
              </div>
              <div className="chart-axis-x"></div>
              <div className="chart-axis-y"></div>
            </div>
          </div>
        </div>

        {/* Payments Trend Skeleton */}
        <div className="chart-card-skeleton">
          <div className="chart-header-skeleton">
            <div className="skeleton-line chart-title"></div>
            <div className="timeframe-selector-skeleton">
              <div className="skeleton-btn"></div>
              <div className="skeleton-btn"></div>
            </div>
          </div>
          <div className="chart-container-skeleton">
            <div className="skeleton-chart bar-chart">
              {/* Simulating bar chart */}
              <div className="chart-grid">
                {[1, 2, 3, 4, 5, 6, 7].map((index) => (
                  <div key={index} className="chart-bar" style={{
                    height: `${40 + Math.random() * 60}%`,
                    animationDelay: `${index * 0.15}s`
                  }}></div>
                ))}
              </div>
              <div className="chart-axis-x"></div>
              <div className="chart-axis-y"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="bottom-section-skeleton">
        {/* Unresolved Chats Skeleton */}
        <div className="chart-card-skeleton chat-resolution-skeleton">
          <div className="chart-header-skeleton">
            <div className="skeleton-line chat-title"></div>
          </div>
          <div className="chart-container-skeleton">
            <div className="unresolved-chats-skeleton">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="chat-item-skeleton">
                  <div className="chat-info-skeleton">
                    <div className="skeleton-line chat-user"></div>
                    <div className="skeleton-line chat-product-ske"></div>
                    <div className="skeleton-line chat-message"></div>
                  </div>
                  <div className="chat-meta-skeleton">
                    <div className="skeleton-line chat-status"></div>
                    <div className="skeleton-line chat-date"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;