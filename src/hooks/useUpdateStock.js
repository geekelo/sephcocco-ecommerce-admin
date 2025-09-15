
import { useMutation } from "@tanstack/react-query";
import { updateStock } from "../services/updateStock";

export const useUpdateStock = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,stockId,payload}) => {
        const response = await updateStock(active_outlet,stockId,payload); 
        return response
      }
    });
  };
  