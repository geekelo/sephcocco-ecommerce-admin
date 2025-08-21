
import { apiClient } from "./axios";

export const assignRider = async (active_outlet,riderId, shippingId) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_shippings/${shippingId}/assign_rider?rider_id=${riderId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
