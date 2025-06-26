import { apiClient } from "./axios";

export const getOrder = async (active_outlet, filters = {}, page, per_page) => {
  try {
    // Build filter object with only non-empty values
    const filter = {};

    if (filters.status) filter.status = filters.status;
    if (filters.search_terms) filter.search_terms = filters.search_terms;
    if (filters.start_date) filter.start_date = filters.start_date;
    if (filters.end_date) filter.end_date = filters.end_date;

    // Build final params
    const params = {
      filter,
      page,
      per_page,
    };

    const response = await apiClient().get(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders`,
      { params }
    );

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
