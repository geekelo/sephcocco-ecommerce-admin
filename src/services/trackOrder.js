import { apiClient } from "./axios";

export const trackOrder = async (riderId) => {
  try {
    const data = await apiClient().get(`/api/v1/rider_locations?rider_id=${riderId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
