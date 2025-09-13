
import { apiClient } from "./axios";

export const otp = async (email, token) => {
  try {
    const data = await apiClient().patch(`api/v1/sephcocco_users/confirm_email?email=${email}&confirmation_token=${token}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};