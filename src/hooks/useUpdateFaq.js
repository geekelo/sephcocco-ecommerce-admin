
import { useMutation } from "@tanstack/react-query";

import { updateFaq } from "../services/updateFaq";

export const useUpdateFaq = () => {
  return useMutation({
    mutationFn: async ({ active_outlet,faqId, payload }) => {
    
      
      const response = await updateFaq(active_outlet,faqId, payload);
      return response;
    }
  });
};
