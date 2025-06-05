
import { useMutation } from "@tanstack/react-query";
import { verifyOTP } from "../services/verifyOTP";

export const useVerifyOTP = () => {
 
    return useMutation({
      mutationFn: async (payload) => {
        const response = await verifyOTP(payload); 
        return response
      }
    });
  };
  