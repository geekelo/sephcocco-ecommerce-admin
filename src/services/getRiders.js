import { apiClient } from "./axios";

export const getRiders = async () => {
  try {
    const data = await apiClient().get(`/api/v1/sephcocco_users/get_riders`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
