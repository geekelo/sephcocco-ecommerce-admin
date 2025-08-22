import { useMutation, useQueryClient } from "@tanstack/react-query";

import { completeDelivery } from "../services/completeDelivery";

export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ active_outlet, shippingId }) => {
      const response = await completeDelivery(active_outlet, shippingId);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch shipping data after successful assignment
      queryClient.invalidateQueries(['shippings']);
      
   
    },
    onError: (error, variables) => {
      console.error('Shipping failed:', error);
    }
  });
};