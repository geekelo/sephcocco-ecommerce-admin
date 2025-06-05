
import { useMutation } from "@tanstack/react-query";
import { register } from "../services/register";


export const useRegister = () => {
 
    return useMutation({
      mutationFn: async (payload) => {
        const response = await register(payload); 
        return response
      }
    });
  };
  