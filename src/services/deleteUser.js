

import { apiClient } from "./axios";

export const deleteUser = async (userId) => {
  try {
    const data = await apiClient().delete(`/api/v1/sephcocco_users/delete_user/${userId}`)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
