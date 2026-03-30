import { apiClient } from "./axios";

export const createWaiterOrder = async (active_outlet, payload) => {
  try {
    const data = await apiClient().post(
      `/api/v1/${active_outlet}/sephcocco_${active_outlet}_orders`,
      payload
    );
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
