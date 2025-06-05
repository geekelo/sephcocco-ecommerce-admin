import { apiClient } from "./axios";

export const forgotPassword = async (email) => {
  try {
    const data = await apiClient().post(`/password_resets?email=${email}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
