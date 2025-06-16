import React from 'react';
import '../styles/ImageGallery.css';

const ImageGallery = ({ selectedImage, images = [], onSelect }) => {
  // Debug logging
  console.log('ImageGallery props:', {
    selectedImage,
    images,
    isImagesArray: Array.isArray(images),
    selectedImageType: typeof selectedImage
  });

  // Ensure selectedImage is a string URL
  const mainImageUrl = typeof selectedImage === 'string' ? selectedImage : '';

  // Ensure images is an array of strings
  const imageUrls = Array.isArray(images) ? images.filter(url => typeof url === 'string') : [];

  return (
    <div className="image-gallery">
      <div className="main-image-container">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt="Main product"
            className="main-image"
            onError={(e) => {
              console.error('Error loading main image:', mainImageUrl);
              e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
            }}
          />
        ) : (
          <div className="main-image-placeholder">
            <span>No image available</span>
          </div>
        )}
      </div>
      
      {imageUrls.length > 0 && (
        <div className="thumbnail-list">
          {imageUrls.map((imageUrl, index) => (
            <div
              key={index}
              className={`thumbnail ${imageUrl === mainImageUrl ? 'active' : ''}`}
              onClick={() => onSelect(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Product view ${index + 1}`}
                onError={(e) => {
                  console.error('Error loading thumbnail:', imageUrl);
                  e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                }}
              />
              {imageUrl === mainImageUrl && (
                <div className="check-icon">✓</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;