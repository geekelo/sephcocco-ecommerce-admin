export const validateProductForm = () => {
    const newErrors = {};
    
    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    // Validate category
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    // Validate quantity
    if (!formData.quantity) {
      newErrors.quantity = 'Stock quantity is required';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }
    
    // Validate price
    if (!formData.price) {
      newErrors.price = 'Product price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    // Validate discount price (optional, but if provided, must be valid)
    if (formData.discountPrice && (isNaN(formData.discountPrice) || parseFloat(formData.discountPrice) <= 0)) {
      newErrors.discountPrice = 'Please enter a valid discount price';
    }
    
    // Validate discount price is less than original price
    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
      newErrors.discountPrice = 'Discount price must be less than original price';
    }
    
    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    // Validate image
    if (!formData.image) {
      newErrors.image = 'Please upload a product image';
    }
    
    return newErrors;
  };