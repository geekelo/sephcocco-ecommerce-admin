import { apiClient } from "./axios";

export const verifyOTP = async (payload) => {
  try {
    const data = await apiClient().post(`password_resets/verify_otp`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
