
import { useMutation } from "@tanstack/react-query";

import { deleteVendor } from "../services/deleteVendor";

export const useDeleteVendor = () => {
  return useMutation({
    mutationFn: async ({ active_outlet,vendorId }) => {
    
      
      const response = await deleteVendor(active_outlet,vendorId);
      return response;
    }
  });
};
