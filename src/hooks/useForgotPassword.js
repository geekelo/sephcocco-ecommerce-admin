
import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "../services/forgotPassword";

export const useForgotPassword = () => {
 
    return useMutation({
      mutationFn: async (email) => {
        const response = await forgotPassword(email); 
        return response
      }
    });
  };
  