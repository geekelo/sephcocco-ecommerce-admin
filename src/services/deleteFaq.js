
import { apiClient } from "./axios";

export const deleteFaq = async (active_outlet,faqId) => {
  try {
    const data = await apiClient().delete(`api/v1/${active_outlet}/sephcocco_${active_outlet}_faqs/${faqId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
