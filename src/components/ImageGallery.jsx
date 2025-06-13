import React from 'react';
import { Check } from 'lucide-react';
import '../styles/ImageGallery.css';

const ImageGallery = ({ images, selectedImage, onSelect }) => {
  console.log('othimage',images);
  console.log("sel",selectedImage);
  
  
  return (
    <div className="image-gallery">
      <img src={selectedImage} alt="Selected" className="main-image" />
      <div className="thumbnail-list">
      {images?.map((img, index) => (
  <div
    key={index}
    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
    onClick={() => onSelect(img)}
  >
    <img src={img} alt={`Thumbnail ${index + 1}`} />
    {selectedImage === img && <Check className="check-icon" size={16} color="#e74c3c" />}
  </div>
))}
      </div>
    </div>
  );
};

export default ImageGallery;