import { apiClient } from "./axios";

export const addLocations = async (payload) => {


  try {
    const data = await apiClient().post(`/api/v1/sephcocco_locations`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
