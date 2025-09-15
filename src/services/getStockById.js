import { apiClient } from "./axios";

export const getStockById = async (active_outlet, stockID) => {
  try {
    if (!stockID) {
      throw new Error('Stock ID is required');
    }
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_stock_managements/${stockID}`);
    return data.data;
  } catch (err) {
    console.error('Error fetching stock:', err);
    throw err;
  }
};
