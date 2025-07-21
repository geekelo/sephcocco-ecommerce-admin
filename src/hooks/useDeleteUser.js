
import { useMutation } from "@tanstack/react-query";

import { deleteUser } from "../services/deleteUser";

export const useDeleteUser = () => {
 
    return useMutation({
      mutationFn: async ({userId}) => {
        const response = await deleteUser(userId); 
        return response
      }
    });
  };
  