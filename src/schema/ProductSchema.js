export const validateProductForm = (formData) => {
  const newErrors = {};

  // Validate product name
  if (!formData.name.trim()) {
    newErrors.name = "Product name is required";
  }

  // Validate category_ids
  if (!Array.isArray(formData.category_ids) || formData.category_ids.length === 0) {
    newErrors.category_ids = "Please select at least one category";
  }

  // Validate quantity
  if (formData.quantity === "") {
    newErrors.quantity = "Stock quantity is required";
  } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
    newErrors.quantity = "Please enter a valid quantity";
  }

  // Validate price
  if (formData.price === "") {
    newErrors.price = "Product price is required";
  } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
    newErrors.price = "Please enter a valid price";
  }

  // Validate discount price (if present)
  if (formData.discountPrice) {
    if (isNaN(formData.discountPrice) || parseFloat(formData.discountPrice) <= 0) {
      newErrors.discountPrice = "Please enter a valid discount price";
    } else if (
      formData.price &&
      parseFloat(formData.discountPrice) >= parseFloat(formData.price)
    ) {
      newErrors.discountPrice = "Discount price must be less than original price";
    }
  }

  // Validate short description
  if (!formData.short_description.trim()) {
    newErrors.short_description = "Short description is required";
  }

  // Validate long description
  if (!formData.long_description.trim()) {
    newErrors.long_description = "Long description is required";
  }

  // Validate main image
  if (!formData.main_image_file) {
    newErrors.mainImage = "Please upload a main product image";
  }

  // Validate other images (optional, but if present, must be images)
  if (
    formData.other_image_files &&
    !Array.isArray(formData.other_image_files)
  ) {
    newErrors.other_image_urls = "Invalid image file format";
  }

  return newErrors;
};
