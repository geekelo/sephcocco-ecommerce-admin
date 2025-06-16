import { apiClient } from "./axios";

export const getAllProduct = async (active_outlet) => {
  try {
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_products`, {
      params: {
        page: 1,
        per_page: 20,
        include: 'categories' // Only include necessary associations
      }
    });
    return data.data;
  } catch (err) {
    console.error('Error fetching products:', err);
    throw err;
  }
};
