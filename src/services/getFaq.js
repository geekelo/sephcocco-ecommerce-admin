
import { apiClient } from "./axios";

export const getFaq = async (active_outlet) => {
  try {
    const data = await apiClient().get(`api/v1/${active_outlet}/sephcocco_${active_outlet}_faqs`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
