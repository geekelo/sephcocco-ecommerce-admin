import { apiClient } from "./axios";

export const getShipping = async (active_outlet,page = 1, per_page = 20) => {
  try {
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_shippings`, {
      params: {
        page,
        per_page
      }
    } );
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
