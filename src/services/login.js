import { apiClient } from "./axios";

export const login = async (payload) => {
  try {
    const data = await apiClient().post(`/api/v1/login`, payload);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
