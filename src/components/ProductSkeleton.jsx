import React from 'react';
import '../styles/ProductSkeleton.css';

const ProductSkeleton = () => (
  <div className="product-card skeleton-product-card">
    <div className="skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  </div>
);

export default ProductSkeleton;
