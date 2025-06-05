import { apiClient } from "./axios";

export const resetPassword = async (otp,payload) => {
  try {
    const data = await apiClient().patch(`password_resets/${otp}?otp=${otp}`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
