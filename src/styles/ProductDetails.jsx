import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';
import LikeButton from './LikeButton';
import ActionButtons from './ActionButtons';
import ExpandableDescription from './ExpandableDescription';
import '../styles/ProductDetails.css';


const ProductDetails = ({ product, onEdit, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState(product?.images?.[0]);

  
  const shortDescription = product?.shortDescription || "No description available";
  const longDescription = product?.longDescription || null;

  if (!product) {
    return <div className="product-loading">Loading product details...</div>;
  }


  return (
    <div className="product-details-container">
      <motion.div 
        className="product-main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ImageGallery
          images={product.images}
          selectedImage={selectedImage}
          onSelect={setSelectedImage}
        />
        <div className="product-details-info">
          <div className="product-header">
            <h1 className="product-name">{product.name}</h1>
            <LikeButton 
              initialLikes={product.likes}
              isLiked={product.isFavorite}
           
            />
          </div>
          
          <p className="stock-status">
            {product.inStock
              ? `In stock : ${product.stockCount} Items`
              : 'Out of stock'}
          </p>
          
          <div className="product-price">${product.price.toFixed(2)}</div>

          <div className="product-description">
            <h3>Product Description</h3>
            <ExpandableDescription
              shortDescription={shortDescription}
              longDescription={longDescription}
            />
          </div>
          
          
          <ActionButtons 
          onEdit={onEdit}
          
  
            onDelete={onDelete}
    
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;