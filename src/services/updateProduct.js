import { apiClient } from "./axios";

export const updateProduct = async (active_outlet, productID,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/${productID}?${productID}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
