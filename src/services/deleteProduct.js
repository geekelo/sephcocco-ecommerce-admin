import { apiClient } from "./axios";

export const deleteProduct = async (active_outlet, productID) => {
  try {
    const data = await apiClient().delete(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/${productID}?${productID}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
