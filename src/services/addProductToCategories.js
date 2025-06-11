import { apiClient } from "./axios";

export const addProductToCategory = async (active_outlet, payload,productID) => {

  try {
    const data = await apiClient().post(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/add_product_to_category?${productID}`, payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
