import { apiClient } from "./axios";

export const getRoles = async () => {
  try {

    const response = await apiClient().get(
      `/api/v1/sephcocco_users/get_user_subroles`
    );

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
