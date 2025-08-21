import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignRider } from "../services/assignRider";

export const useAssignRider = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ active_outlet, riderId, shippingId }) => {
      const response = await assignRider(active_outlet, riderId, shippingId);
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch shipping data after successful assignment
      queryClient.invalidateQueries(['shippings']);
      
      console.log('Rider assignment successful:', data);
    },
    onError: (error, variables) => {
      console.error('Rider assignment failed:', error);
    }
  });
};