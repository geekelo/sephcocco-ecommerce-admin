import { apiClient } from "./axios";

export const addProductCategories = async (active_outlet, payload) => {
  try {
    const data = await apiClient().post(`/api/v1/${active_outlet}/product_categories `, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
