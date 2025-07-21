

import { apiClient } from "./axios";

export const updateUser = async (userId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/update_user_outlets/?id=${userId}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
