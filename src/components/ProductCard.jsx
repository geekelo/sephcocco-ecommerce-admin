import React, { useState } from 'react';
import { Edit, Trash2, Heart, Eye, EyeOff } from 'lucide-react';
import { useSwitchProductVisibility } from '../hooks/useSwitchProductVisibility';
import '../styles/ProductCard.css';
import { getActiveOutlet } from '../utils/getActiveOutlets';

const ProductCard = ({ product, onView, onEdit, onDelete, onVisibilityChange, showVisible = true }) => {
  const active_outlet = getActiveOutlet()
  const [isVisible, setIsVisible] = useState(product?.visible);
  const switchVisibilityMutation = useSwitchProductVisibility();

  const handleVisibilityToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await switchVisibilityMutation.mutateAsync({
        active_outlet: active_outlet,
        productId: product.id
      });

      // Toggle the local state
      const newVisibility = !isVisible;
      setIsVisible(newVisibility);
      
  
      if (onVisibilityChange) {
        onVisibilityChange(product.id, newVisibility);
      }
    } catch (error) {
      console.error('Failed to toggle product visibility:', error);
      // You might want to show a toast/notification here
    }
  };

  return (
    <>
      <div className={`product-card`}>
        {/* 👁️ Preview icon at the top-right corner */}
        {onView && <div className="preview-icon" onClick={onView} title="View product">
          <Eye size={20} color='#000'/>
        </div>}

        <div className="product-image">
          <img src={product?.main_image_url || product?.image} alt={product?.name} />
        </div>

        <div className="product-details">
          <div className="product-header">
            <h3 className="product-name">{product?.name}</h3>
            <div className="product-rating">
              <Heart 
                fill={(product?.likes || product?.rating) > 0 ? '#e74c3c' : 'none'}
                color={(product?.likes || product?.rating) > 0 ? '#e74c3c' : '#666'}
                size={14} 
                className="heart-icon"  
              />
              <span className="rating-value">{(product?.likes || product?.rating)}</span>
            </div>
          </div>

          <div className="discount-price">
            ₦{product?.price} {product?.discount_price && <span className='product-price'> ₦{product?.discount_price}</span>}
          </div>

          <div className="product-stock">
            <div className="stock-info">
              {product?.out_of_stock_status ? "Out of stock" : "In Stock"} · {product?.amount_in_stock || product?.stockCount} items
            </div>
          </div>

          {showVisible && <div className="product-visibility">
            <div className="visibility-control">
              <span className="visibility-label">
                {isVisible ? 'Public' : 'Hidden'}
              </span>
              <div className="switch-container">
                <input
                  type="checkbox"
                  id={`visibility-${product.id}`} // Changed from product?.order_number to product.id
                  className="visibility-switch"
                  checked={isVisible}
                  onChange={handleVisibilityToggle}
                  disabled={switchVisibilityMutation.isPending}
                />
                <label htmlFor={`visibility-${product.id}`} className="switch-label"> {/* Changed from product?.order_number to product.id */}
                  <span className="switch-slider">
                  </span>
                </label>
              </div>
            </div>
          </div>}

          <div className="product-actions">
            {onEdit && <button
              className="action-button-product edit-button"
              onClick={onEdit}
              title="Edit product"
            >
              <Edit size={16} className="edit-icon" />
              <span>Edit</span>
            </button>}
         
            {onDelete && <button
              className="action-button-product delete-button-product"
              onClick={onDelete}
              title="Delete product"
            >
              <Trash2 size={16} className="delete-icon" />
              <span>Delete</span>
            </button>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;