
import { apiClient } from "./axios";

export const resendotp = async (email) => {
  try {
    const data = await apiClient().post(`api/v1/sephcocco_users/request_email_confirmation_token?email=${email}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};