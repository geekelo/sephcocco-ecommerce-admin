
import { useMutation } from "@tanstack/react-query";

import { addProduct } from "../services/addProduct";

export const useAddProduct = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,payload}) => {
        const response = await addProduct(active_outlet,payload); 
        return response
      }
    });
  };
  