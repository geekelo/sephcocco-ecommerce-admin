import React, { useState } from 'react';
import { Edit, Trash2, Heart, Eye } from 'lucide-react';
import '../styles/ProductCard.css';


const ProductCard = ({ product,  onView, onEdit, onDelete}) => {
  const { 
    name, 
    image, 
    price, 
    rating, 
    stockCount, 
    stockStatus 
  } = product;


  return (
    <>
      <div className="product-card">
        {/* 👁️ Preview icon at the top-right corner */}
        <div className="preview-icon" onClick={onView} title="View product">
          <Eye size={20} color='#000'/>
        </div>

        <div className="product-image">
          <img src={image} alt={name} />
        </div>

        <div className="product-details">
          <div className="product-header">
            <h3 className="product-name">{name}</h3>
            <div className="product-rating">
              <Heart size={14} className="heart-icon" />
              <span className="rating-value">{rating}</span>
            </div>
          </div>

          <div className="product-price">₦{price}</div>

          <div className="product-stock">
            <div className="stock-info">{stockStatus} · {stockCount} items</div>
          </div>

          <div className="product-actions">
            <button 
              className="action-button edit-button" 
              onClick={onEdit}
              title="Edit product"
            >
              <Edit size={16} className="edit-icon" />
              <span>Edit</span>
            </button>

            <button 
              className="action-button delete-button-product" 
              onClick={onDelete}
              title="Delete product"
            >
              <Trash2 size={16} className="delete-icon" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

   
    </>
  );
};

export default ProductCard;
