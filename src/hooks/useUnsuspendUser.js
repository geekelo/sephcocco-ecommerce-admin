
import { useMutation } from "@tanstack/react-query";


import { unsuspendUser } from "../services/UnsuspendUser";

export const useUnsuspendUser = () => {
 
    return useMutation({
      mutationFn: async ({userId}) => {
        const response = await unsuspendUser(userId); 
        return response
      }
    });
  };
  