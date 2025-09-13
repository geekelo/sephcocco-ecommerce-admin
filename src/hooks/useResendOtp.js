
import { useMutation } from "@tanstack/react-query";

import { resendotp } from "../services/resendOtp";

export const useResendOtp = () => {
 
    return useMutation({
      mutationFn: async (email) => {
        const response = await resendotp(email);
        return response
      }
    });
  };
  