import { apiClient } from "./axios";

export const forgotPassword = async (payload) => {
  try {
    const data = await apiClient().post(`/password_resets`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
