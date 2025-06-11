
import { useMutation } from "@tanstack/react-query";
import { addProductToCategory } from "../services/addProductToCategories";

export const useAddProductToCategory = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,payload,productId}) => {
        const response = await addProductToCategory(active_outlet,payload,productId); 
        return response
      }
    });
  };
  