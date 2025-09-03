import { apiClient } from "./axios";

export const getAllProduct = async (active_outlet,     filters = {}, page = 1, per_page = 20) => {
  try {
        const filter = {};

    if (filters.status) filter.status = filters.status;
    if (filters.category_id) filter.category_id = filters.category_id;
    if (filters.search_terms) filter.search_terms = filters.search_terms;
    if (filters.start_date) filter.start_date = filters.start_date;
    if (filters.end_date) filter.end_date = filters.end_date;
    if (filters.sort_by_likes) filter.sort_by_likes = filters.sort_by_likes;
    if (filters.sort_by_stock) filter.sort_by_stock = filters.sort_by_stock;


   const params = {
      filter,
      page,
      per_page,
       include: 'categories'
    };
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products`, 
    {params}
    );
    return data.data;
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
};