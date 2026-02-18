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

export const updateBulkStock = async (active_outlet, payload) => {
  try {


    const data = await apiClient().post(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_stock_managements/bulk_create`, payload);
    console.log({BULK: data});
    
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
