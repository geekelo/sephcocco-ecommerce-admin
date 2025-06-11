
import { useMutation } from "@tanstack/react-query";
import { deleteProduct } from "../services/deleteProduct";

export const useDeleteProduct = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,productId}) => {
        const response = await deleteProduct(active_outlet,productId); 
        return response
      }
    });
  };
  