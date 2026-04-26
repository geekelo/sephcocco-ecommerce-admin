import { useMutation } from "@tanstack/react-query";
import { refundWaiterOrder } from "../services/refundWaiterOrder";

export const useRefundWaiterOrder = () => {
  return useMutation({
    mutationFn: ({ active_outlet, orderIds }) =>
      refundWaiterOrder(active_outlet, orderIds),
  });
};
