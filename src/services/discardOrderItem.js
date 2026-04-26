import { apiClient } from "./axios";

// TODO: update endpoint and payload key/structure as needed
export const discardOrderItem = async (active_outlet, orderIds) => {
  try {
    const response = await apiClient().patch(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/${orderIds}`,
      { [`sephcocco_${active_outlet}_order`]: { order_ids: orderIds, status: "discarded" } }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
