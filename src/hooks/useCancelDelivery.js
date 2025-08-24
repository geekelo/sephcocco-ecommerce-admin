import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelDelivery } from "../services/cancelDelivery";

export const useCancelDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ active_outlet, shippingId }) => {
      const response = await cancelDelivery(active_outlet, shippingId);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch shipping data after successful assignment
      queryClient.invalidateQueries(['shippings']);
      
   
    },
    onError: (error, variables) => {
      console.error('shipping failed:', error);
    }
  });
};