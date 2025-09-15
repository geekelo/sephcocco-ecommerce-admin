
import { apiClient } from "./axios";

export const deleteStock = async (active_outlet, stockID) => {
  try {
    const data = await apiClient().delete(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_stock_managements/${stockID}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
