
import { useMutation } from "@tanstack/react-query";

import { deleteDepartment } from "../services/deleteDepartment";

export const useDeleteDepartment = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,departmentId}) => {
        const response = await deleteDepartment(active_outlet,departmentId); 
        return response
      }
    });
  };
  