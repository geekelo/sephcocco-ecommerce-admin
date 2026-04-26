import { apiClient } from "./axios";

export const getWaiters = async () => {
  try {
    const response = await apiClient().get(`/api/v1/sephcocco_users/get_waiters`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
