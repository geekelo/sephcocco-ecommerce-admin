export const getCompletedWaiterOrders = async (active_outlet, page, per_page, filters = {}) => {
  try {
    const params = {
      page,
      per_page,
      filters: {}
    };

    if (filters.start_date) params.filters.start_date = filters.start_date;
    if (filters.end_date) params.filters.end_date = filters.end_date;

    const data = await apiClient().get(
      `api/v1/${active_outlet}/sephcocco_${active_outlet}_orders/completed`,
      { params }
    );

    return data;
  } catch (error) {
    throw error;
  }
};