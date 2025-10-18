
import { apiClient } from "./axios";

export const deleteVendor = async (active_outlet,vendorId) => {
  try {
    const data = await apiClient().delete(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_vendors/${vendorId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
