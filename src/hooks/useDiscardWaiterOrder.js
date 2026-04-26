import { useMutation } from "@tanstack/react-query";
import { discardWaiterOrder } from "../services/discardWaiterOrder";

export const useDiscardWaiterOrder = () => {
  return useMutation({
    mutationFn: ({ active_outlet, orderIds }) =>
      discardWaiterOrder(active_outlet, orderIds),
  });
};
