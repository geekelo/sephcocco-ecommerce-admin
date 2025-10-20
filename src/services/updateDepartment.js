import { apiClient } from "./axios";

export const updateDepartment = async (active_outlet, departmentId,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_departments/${departmentId}`,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
