

import { apiClient } from "./axios";

export const deleteUser = async (userId) => {
  try {
    const data = await apiClient().patch(`/api/v1/sephcocco_users/soft_delete_user?id=${userId}`)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
