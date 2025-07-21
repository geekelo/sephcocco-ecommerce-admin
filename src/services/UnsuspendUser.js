

import { apiClient } from "./axios";

export const unsuspendUser = async (userId) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/unsuspend_user/?id=${userId}`)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
