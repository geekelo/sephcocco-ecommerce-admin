import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ImageGallery from './ImageGallery';
import LikeButton from './LikeButton';
import ActionButtons from './ActionButtons';
import ExpandableDescription from './ExpandableDescription';
import '../styles/ProductDetails.css';
import { X } from 'lucide-react';


const ProductDetails = ({ product, onEdit, onDelete, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(product?.image_url);

  console.log('testing',product);
  
  const shortDescription = product?.short_description || "No description available";
  const longDescription = product?.long_description || null;

  if (!product) {
    return <div className="product-loading">Loading product details...</div>;
  }


  return (
    <div className="modal-overlay-product-details">
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
          images={product?.other_images}
          selectedImage={selectedImage}
          onSelect={setSelectedImage}
        />
        <div className="product-details-info">
          <div className="product-header">
            <h1 className="product-name">{product.name}</h1>
        
          </div>
          
          <p className="stock-status">
          <LikeButton 
              initialLikes={product.likes}
             
           
            />
            {!product.out_of_stock_status
              ? `In stock : ${product.amount_in_stock} Items`
              : 'Out of stock'}
          </p>
          
          <div className="product-price">₦{product.price}</div>

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
    </div>

  );
};

export default ProductDetails;