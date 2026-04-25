import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';
import LikeButton from './LikeButton';
import ActionButtons from './ActionButtons';
import ExpandableDescription from './ExpandableDescription';
import '../styles/ProductDetails.css';
import { X } from 'lucide-react';


const ProductDetails = ({ product, style,onEdit, onDelete, onClose }) => {


  
  const [selectedImage, setSelectedImage] = useState(product?.main_image_url);

  
  const shortDescription = product?.short_description
  const longDescription = product?.long_description 

  if (!product) {
    return <div className="product-loading">Loading product details...</div>;
  }


  return (
    <div className="modal-overlay-product-details" style={style}>
    <div className="product-container">
    <button onClick={onClose} type="button" className="close-button-product" >
            <X size={24} />
          </button>
      <motion.div 
        className="product-main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ImageGallery
          images={product?.other_image_urls}
          selectedImage={selectedImage || '/image.png'}
          onSelect={setSelectedImage}
        />
        <div className="product-details-info">
          <div className="product-header">
            <h1 className="product-name">{product.name}</h1>
        
          </div>
          
          <div className="stock-status">
            <LikeButton
              initialLikes={product.likes}
              isLiked={product.likes > 0}
            />
            {!product.out_of_stock_status
              ? `In stock : ${product.amount_in_stock} Items`
              : 'Out of stock'}
          </div>

          <p className="stock-status">
  Categories: {
    product?.categories?.length === 1
      ? product?.categories[0]?.name
      : product?.categories?.length === 2
      ? `${product?.categories[0]?.name} and ${product?.categories[1]?.name}`
      : product?.categories
          ?.map(item => item.name)
          ?.slice(0, -1)
          ?.join(", ") + `, and ${product?.categories?.at(-1).name}`
  }
</p>
          <div className="discount-price"> ₦{product.price} <span className='product-price'> ₦{product.discount_price}</span></div>
  
          <div className="product-description">
            <h3>Product Description</h3>
            <ExpandableDescription
              shortDescription={shortDescription}
              longDescription={longDescription}
            />
          </div>
          
          {onEdit && onDelete &&   <ActionButtons 
          onEdit={onEdit}
          
  
            onDelete={onDelete}
    
          />}
        
        </div>
      </motion.div>
    </div>
    </div>

  );
};

export default ProductDetails;