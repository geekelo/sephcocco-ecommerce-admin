import { apiClient } from "./axios";

export const updateStock = async (active_outlet, stockID,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_stock_managements/${stockID}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
