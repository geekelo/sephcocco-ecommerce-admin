import React, { useState } from 'react';
import { Edit, Trash2, Heart, Eye, EyeOff } from 'lucide-react';
import { useSwitchProductVisibility } from '../hooks/useSwitchProductVisibility';
import '../styles/ProductCard.css';
import { getActiveOutlet } from '../utils/getActiveOutlets';

const ProductCard = ({ product, onView, onEdit, onDelete, onVisibilityChange }) => {
  // const {
  //   // order_number: productId,
  //   name,
  //   main_image_url,
  //   price,
  //   likes,
  //   amount_in_stock,
  //   out_of_stock_status,
  //   visible
  // } = product;
const active_outlet = getActiveOutlet()
  const [isVisible, setIsVisible] = useState(product?.visible);
  const switchVisibilityMutation = useSwitchProductVisibility();
console.log('okk',product);
const orderNumber = product?.order_number
  const handleVisibilityToggle = async () => {
    try {
    const res =  await switchVisibilityMutation.mutateAsync({
        active_outlet,
      orderNumber
      });
      console.log(res);
      
      // Toggle the local state
      const newVisibility = !isVisible;
      setIsVisible(newVisibility);
      
      // Call parent callback if provided
      if (onVisibilityChange) {
        onVisibilityChange(product?.order_number, newVisibility);
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
        <div className="preview-icon" onClick={onView} title="View product">
          <Eye size={20} color='#000'/>
        </div>

        <div className="product-image">
          <img src={product?.main_image_url} alt={name} />
         
        </div>

        <div className="product-details">
          <div className="product-header">
            <h3 className="product-name">{product?.name}</h3>
            <div className="product-rating">
              <Heart 
                fill={product?.likes > 0 ? '#e74c3c' : 'none'}
                color={product?.likes > 0 ? '#e74c3c' : '#666'}
                size={14} 
                className="heart-icon"  
              />
              <span className="rating-value">{product?.likes}</span>
            </div>
          </div>
{
product?.discount_price  ? <div className="discount-price"> ₦{product?.discount_price } <span className='product-price'> ₦{product?.price}</span></div> : <p className="discount-price">
  ₦{product?.price}
</p>
}
          


          <div className="product-stock">
            <div className="stock-info">
              {product?.out_of_stock_status ? "Out of stock" : "In Stock"} · {product?.amount_in_stock} items
            </div>
          </div>


          {/* Visibility Toggle Switch */}
          <div className="product-visibility">
            <div className="visibility-control">
              <span className="visibility-label">
                {isVisible ? 'Public' : 'Hidden'}
              </span>
              <div className="switch-container">
                <input
                  type="checkbox"
                  id={`visibility-${product?.order_number}`}
                  className="visibility-switch"
                  checked={isVisible}
                  onChange={handleVisibilityToggle}
                  disabled={switchVisibilityMutation.isPending}
                />
                <label htmlFor={`visibility-${product?.order_number}`} className="switch-label">
                  <span className="switch-slider">
                    
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="product-actions">
            {onEdit &&    <button
              className="action-button-product edit-button"
              onClick={onEdit}
              title="Edit product"
            >
              <Edit size={16} className="edit-icon" />
              <span>Edit</span>
            </button>}
         
            {onDelete &&   <button
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