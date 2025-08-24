import { apiClient } from "./axios";

export const cancelDelivery = async (active_outlet, shippingId) => {


  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_shippings/${shippingId}/cancel_delivery`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
