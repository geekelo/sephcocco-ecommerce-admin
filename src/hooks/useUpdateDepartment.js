
import { useMutation } from "@tanstack/react-query";
import { updateDepartment } from "../services/updateDepartment";

export const useUpdateDepartment = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,departmentId,payload}) => {
        const response = await updateDepartment(active_outlet,departmentId,payload); 
        return response
      }
    });
  };
  