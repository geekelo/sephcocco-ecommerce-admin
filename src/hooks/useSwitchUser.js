
import { useMutation } from "@tanstack/react-query";



import { switchRole } from "../services/switchRole";

export const useSwitchRole = () => {
 
    return useMutation({
      mutationFn: async ({userId,payload}) => {
        const response = await switchRole(userId,payload); 
        return response
      }
    });
  };
  