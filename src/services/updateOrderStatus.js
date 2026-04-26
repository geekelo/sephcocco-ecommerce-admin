

import { apiClient } from "./axios";

export const updateOrderStatus = async (active_outlet, orderIds, status) => {
  try {
    const data = await apiClient().patch(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/${orderIds}`,
      {
        order_ids: orderIds,
        [`sephcocco_${active_outlet}_order`]: { status },
      }
    );
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
