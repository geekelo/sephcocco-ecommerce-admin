import { apiClient } from "./axios";

export const deleteLocations = async (locationId) => {
  try {
    const data = await apiClient().delete(`/api/v1/sephcocco_locations/${locationId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
