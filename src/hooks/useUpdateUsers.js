
import { useMutation } from "@tanstack/react-query";

import { updateUser } from "../services/UpdateUser";

export const useUpdateUsers = () => {
 
    return useMutation({
      mutationFn: async ({userId,payload}) => {
        const response = await updateUser(userId,payload); 
        return response
      }
    });
  };
  