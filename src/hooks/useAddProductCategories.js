
import { useMutation } from "@tanstack/react-query";

import { addProductCategories } from "../services/addProductCategories";

export const useAddProductCategores = () => {
 
    return useMutation({
      mutationFn: async (active_outlet,payload) => {
        const response = await addProductCategories(active_outlet,payload); 
        return response
      }
    });
  };
  