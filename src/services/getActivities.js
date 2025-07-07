import { apiClient } from "./axios";

export const getActivities = async (active_outlet) => {
  try {
    const data = await apiClient().get(`api/v1/${active_outlet}/sephcocco_${active_outlet}_admin_activities`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
