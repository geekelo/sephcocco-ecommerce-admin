import { apiClient } from "./axios";

export const resetPassword = async (otp,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/password_resets/${otp}?otp=${otp}`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
