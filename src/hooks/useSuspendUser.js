
import { useMutation } from "@tanstack/react-query";



import { suspendUser } from "../services/suspendUser";

export const useSuspendUser = () => {
 
    return useMutation({
      mutationFn: async ({userId}) => {
        const response = await suspendUser(userId); 
        return response
      }
    });
  };
  