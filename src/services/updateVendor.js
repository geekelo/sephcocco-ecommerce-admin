
import { apiClient } from "./axios";

export const updateVendor = async (active_outlet,vendorId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_vendors/${vendorId}`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
