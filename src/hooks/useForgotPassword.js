
import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "../services/forgotPassword";

export const useForgotPassword = () => {
 
    return useMutation({
      mutationFn: async (payload) => {
        const response = await forgotPassword(payload); 
        return response
      }
    });
  };
  