import { apiClient } from "./axios";

export const register = async (payload) => {
  try {
    const data = await apiClient().post(`/api/v1/signup`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
