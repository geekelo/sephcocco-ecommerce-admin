
import { useMutation } from "@tanstack/react-query";
import { updateOrderStatus } from "../services/updateOrderStatus";

export const useUpdateOrderStatus = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,orderId,payload}) => {
        const response = await updateOrderStatus(active_outlet,orderId,payload); 
        return response
      }
    });
  };
  