

import { apiClient } from "./axios";

export const updateOrderStatus = async (active_outlet,orderId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/${orderId}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
