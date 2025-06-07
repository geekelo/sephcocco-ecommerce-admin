
import { useMutation } from "@tanstack/react-query";

import { deleteProductCategories } from "../services/deleteProductCategories";

export const useDeleteProductCategores = () => {
 
    return useMutation({
      mutationFn: async (active_outlet,productId) => {
        const response = await deleteProductCategories(active_outlet,productId); 
        return response
      }
    });
  };
  