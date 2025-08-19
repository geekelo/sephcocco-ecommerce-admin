import { apiClient } from "../axios";

export const overallPerformance = async (active_outlet, year) => {
  try {
    const data = await apiClient().get(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_analytics/overview_performance?year=${year}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
