import { apiClient } from "./axios";

export const updateLocations = async ( locationId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_locations/${locationId}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
