import { apiClient } from "./axios";

export const updateProductCategories = async (active_outlet, productID,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/product_categories/${productID}?id=${productID}`,payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
