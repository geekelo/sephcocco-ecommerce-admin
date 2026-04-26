import { apiClient } from "./axios";

export const discardWaiterOrder = async (active_outlet, orderIds) => {
  try {
    const response = await apiClient().patch(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/${orderIds[0]}`,
      {
        order_ids: orderIds,
        [`sephcocco_${active_outlet}_order`]: { status: "discarded" },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
