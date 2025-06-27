import { apiClient } from "./axios";

export const switchProductVisibility = async (active_outlet, productID) => {
  try {
    const data = await apiClient().post(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products/${productID}/switch_visibility?${productID}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
