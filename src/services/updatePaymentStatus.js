

import { apiClient } from "./axios";

export const updatePaymentStatus = async (active_outlet, paymentId, payload) => {
  try {
    const data = await apiClient().patch(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_payments/${paymentId}`,
      payload
    );
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
