
import { apiClient } from "./axios";

export const updateFaq = async (active_outlet,faqId,payload) => {
  try {
    const data = await apiClient().patch(`api/v1/${active_outlet}/sephcocco_${active_outlet}_faqs/id=${faqId}`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
