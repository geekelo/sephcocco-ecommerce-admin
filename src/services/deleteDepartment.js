
import { apiClient } from "./axios";

export const deleteDepartment = async (active_outlet, departmentId) => {
  try {
    const data = await apiClient().delete(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_departments/${departmentId}`);
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
