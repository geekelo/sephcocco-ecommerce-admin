
import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../services/resetPassword";

export const useResetPassword = () => {
 
    return useMutation({
      mutationFn: async ({ otp, payload }) => {
        const response = await resetPassword(otp,payload); 
        return response
      }
    });
  };
  