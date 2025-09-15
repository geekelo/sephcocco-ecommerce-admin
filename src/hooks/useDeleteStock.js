
import { useMutation } from "@tanstack/react-query";

import { deleteStock } from "../services/deleteStock";

export const useDeleteStock = () => {
  return useMutation({
    mutationFn: async ({ active_outlet,stockId }) => {
    
      
      const response = await deleteStock(active_outlet,stockId);
      return response;
    }
  });
};
