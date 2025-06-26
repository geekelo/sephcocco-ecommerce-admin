import { apiClient } from "./axios";

export const getOrderById = async (active_outlet,orderId ) => {
  try {
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/id=${orderId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
