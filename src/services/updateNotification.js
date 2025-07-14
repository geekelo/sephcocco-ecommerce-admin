import { apiClient } from "./axios";

export const updateNotifyAdmin = async (active_outlet, notifyID,payload) => {
  try {
    const data = await apiClient().patch(`/api/v1/${active_outlet}/sephcocco_${active_outlet}_admin_notifications/${notifyID} `,payload)
    return data.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
