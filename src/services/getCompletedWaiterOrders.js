import { apiClient } from "./axios";

export const getCompletedWaiterOrders = async (active_outlet, page, per_page, filters = {}) => {
  try {
    // Match the app-wide convention used by `getOrders`: use `filter` (not `filters`)
    // and only include non-empty values.
    const filter = {};
    if (filters.start_date) filter.start_date = filters.start_date;
    if (filters.end_date) filter.end_date = filters.end_date;

    const params = { page, per_page, filter };

    const response = await apiClient().get(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/completed`,
      { params }
    );
console.log({COMPLD: data});

    return response.data;
  } catch (error) {
    throw error;
  }
};