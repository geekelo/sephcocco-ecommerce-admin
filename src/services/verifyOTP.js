import { apiClient } from "./axios";

export const verifyOTP = async (email,otp) => {
  try {
    const data = await apiClient().post(`/password_resets/verify_otp?otp=${otp}&email=${email}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
