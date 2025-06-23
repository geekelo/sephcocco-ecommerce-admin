import { apiClient } from "./axios";

export const uploadProductImage = async (active_outlet, productId, file, isMainImage = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('is_main_image', isMainImage ? 'true' : 'false');

  try {
    const response = await apiClient().post(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/${productId}/upload_image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("Product image upload failed:", err);
    throw err;
  }
};