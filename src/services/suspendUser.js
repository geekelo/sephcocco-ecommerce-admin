

import { apiClient } from "./axios";

export const suspendUser = async (userId) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/suspend_user/?id=${userId}`)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
