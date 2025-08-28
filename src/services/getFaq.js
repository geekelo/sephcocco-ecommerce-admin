
import { apiClient } from "./axios";

export const getFaq = async (active_outlet,filters = {}, page = 1, per_page = 20) => {
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
    const data = await apiClient().get(`api/v1/${active_outlet}/sephcocco_${active_outlet}_faqs`,{params});
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
