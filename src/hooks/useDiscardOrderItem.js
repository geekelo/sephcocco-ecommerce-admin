import { useMutation } from "@tanstack/react-query";
import { discardOrderItem } from "../services/discardOrderItem";

export const useDiscardOrderItem = () => {
  return useMutation({
    mutationFn: ({ active_outlet, orderIds }) =>
      discardOrderItem(active_outlet, orderIds),
  });
};
