
import { useMutation } from "@tanstack/react-query";
import { updateProduct } from "../services/updateProduct";

export const useUpdateProduct = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,productId,payload}) => {
        const response = await updateProduct(active_outlet,productId,payload); 
        return response
      }
    });
  };
  