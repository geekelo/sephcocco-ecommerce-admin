import { apiClient } from "./axios";

export const getProductById = async (active_outlet, productID) => {
  try {
    if (!productID) {
      throw new Error('Product ID is required');
    }
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/${productID}`);
    return data.data;
  } catch (err) {
    console.error('Error fetching product:', err);
    throw err;
  }
};
