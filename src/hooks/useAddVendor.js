
import { useMutation } from "@tanstack/react-query";
import { createVendor } from "../services/createVendor";

export const useAddVendor = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
    
      
      const response = await createVendor(active_outlet, payload);
      return response;
    }
  });
};
