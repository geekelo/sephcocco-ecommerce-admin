import { apiClient } from "./axios";

export const getWaiters = async () => {
  try {
    // Primary endpoint (newer deployments)
    try {
      const response = await apiClient().get(`/api/v1/get_waiters`);
      return response.data;
    } catch (err) {
      // Fallback for deployments still using the older route
      const status = err?.response?.status;
      if (status && status !== 404) throw err;
      const fallback = await apiClient().get(`/api/v1/sephcocco_users/get_waiters`);
      return fallback.data;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};
