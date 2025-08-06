

import { apiClient } from "./axios";

export const switchRole = async (userId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/switch_user_role/?id=${userId}`, payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
