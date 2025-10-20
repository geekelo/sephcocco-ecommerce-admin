
import { useMutation } from "@tanstack/react-query";

import { createDepartment } from "../services/createDepartment";

export const useAddDepartment = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
    
      
      const response = await createDepartment(active_outlet, payload);
      return response;
    }
  });
};
