
import { useMutation } from "@tanstack/react-query";
import { updateProductCategories } from "../services/updateProductCategories";

export const useUpdateProductCategores = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,productId,payload}) => {
        const response = await updateProductCategories(active_outlet,productId,payload); 
        return response
      }
    });
  };
  