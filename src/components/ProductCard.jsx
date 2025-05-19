
import React from 'react';
import { Edit, Trash2, Heart } from 'lucide-react';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const { 
    name, 
    image, 
    price, 
    rating, 
    stockCount, 
    stockStatus 
  } = product;

  const handleEdit = () => {
    console.log('Edit product:', product);
    // Implement edit functionality
  };

  const handleDelete = () => {
    console.log('Delete product:', product);
    // Implement delete functionality
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      // Delete logic here
    }
  };

  return (
    <div className="product-card">
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
        
        <div className="product-price">${price.toFixed(2)}</div>
        
        <div className="product-stock">
          <div className="stock-info">{stockStatus} · {stockCount} items</div>
        </div>
        
        <div className="product-actions">
          <button 
            className="action-button edit-button" 
            onClick={handleEdit}
            title="Edit product"
          >
            <Edit size={16} className="edit-icon" />
            <span>Edit</span>
          </button>
          
          <button 
            className="action-button delete-button" 
            onClick={handleDelete}
            title="Delete product"
          >
            <Trash2 size={16} className="delete-icon" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;