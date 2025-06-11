import { apiClient } from "./axios";

export const deleteProductCategories = async (active_outlet, productID) => {
  try {
    const data = await apiClient().delete(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_product_categories/${productID}?id=${productID}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
