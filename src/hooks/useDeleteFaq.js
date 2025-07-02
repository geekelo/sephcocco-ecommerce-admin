
import { useMutation } from "@tanstack/react-query";


import { deleteFaq } from "../services/deleteFaq";

export const useDeleteFaq = () => {
  return useMutation({
    mutationFn: async ({ active_outlet,faqId }) => {
    
      
      const response = await deleteFaq(active_outlet,faqId);
      return response;
    }
  });
};
