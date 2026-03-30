import { apiClient } from "./axios";

export const getPendingWaiterOrders = async (active_outlet, page, per_page) => {
  try {
    const params = { page, per_page };
    const data = await apiClient().get(
      `api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/pending`,
      { params }
    );
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
