import { useMutation } from '@tanstack/react-query';
import { uploadProductImage } from '../services/productImageUpload';


export const useProductImageUpload = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, productId, file, isMainImage }) => {
      return await uploadProductImage(active_outlet, productId, file, isMainImage);
    },
    onError: (error) => {
      console.error('Product image upload failed:', error);
    }
  });
};