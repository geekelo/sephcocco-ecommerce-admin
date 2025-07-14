
import { useMutation } from "@tanstack/react-query";

import { createFaq } from "../services/createFaq";

export const useAddFaq = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
    
      
      const response = await createFaq(active_outlet, payload);
      return response;
    }
  });
};
