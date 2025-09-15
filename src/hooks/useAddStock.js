
import { useMutation } from "@tanstack/react-query";
import { createStock } from "../services/createStock";

export const useAddStock = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
    
      
      const response = await createStock(active_outlet, payload);
      return response;
    }
  });
};
