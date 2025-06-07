import { apiClient } from "./axios";

export const getProductCategories = async (active_outlet, productID) => {
  try {
    const data = await apiClient().get(` /api/v1/${active_outlet}/product_categories/${productID}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
