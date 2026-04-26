
import { useMutation } from "@tanstack/react-query";
import { updateOrderStatus } from "../services/updateOrderStatus";

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, orderIds, status }) => {
      const response = await updateOrderStatus(active_outlet, orderIds, status);
      return response;
    }
  });
};
  