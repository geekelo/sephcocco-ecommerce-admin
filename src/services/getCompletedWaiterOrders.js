import { apiClient } from "./axios";

export const getCompletedWaiterOrders = async (active_outlet, page, per_page, filters = {}) => {
  try {
    const params = { page, per_page };
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date)   params.end_date   = filters.end_date;
    const data = await apiClient().get(
      `api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/completed`,
      { params }
    );
    // console.log({DATA: data.data});
    
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
