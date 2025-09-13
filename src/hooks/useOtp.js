import { useMutation } from "@tanstack/react-query";
import { otp } from "../services/otp";

export const useOtp = () => {
  return useMutation({
    mutationFn: async ({ email, token }) => {
      const response = await otp(email, token);
      return response;
    }
  });
};