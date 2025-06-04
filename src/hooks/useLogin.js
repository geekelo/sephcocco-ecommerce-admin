
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/login";

export const useLogin = () => {
 
    return useMutation({
      mutationFn: async (payload) => {
        const response = await login(payload); 
        return response
      }
    });
  };
  