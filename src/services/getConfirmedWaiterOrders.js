import { apiClient } from "./axios";

export const getConfirmedWaiterOrders = async (active_outlet, page, per_page, filters = {}) => {
  try {
    const filter = {};
    if (filters.start_date) filter.start_date = filters.start_date;
    if (filters.end_date) filter.end_date = filters.end_date;

    const params = { page, per_page, filter };

    const response = await apiClient().get(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/paid`,
      { params }
    );

    return response.data;
  } catch (err) {
    throw err;
  }
};

