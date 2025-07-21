

import { apiClient } from "./axios";

export const updateUser = async (userId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/${userId}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
