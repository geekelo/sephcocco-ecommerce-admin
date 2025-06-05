
import { useMutation } from "@tanstack/react-query";
import { verifyOTP } from "../services/verifyOTP";

export const useVerifyOTP = () => {
 
    return useMutation({
      mutationFn: async ({email,otp}) => {
        const response = await verifyOTP(email,otp); 
        return response
      }
    });
  };
  