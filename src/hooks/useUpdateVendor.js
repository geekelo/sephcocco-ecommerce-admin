
import { useMutation } from "@tanstack/react-query";

import { updateVendor } from "../services/updateVendor";

export const useUpdateVendor = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,vendorId,payload}) => {
        const response = await updateVendor(active_outlet,vendorId,payload); 
        return response
      }
    });
  };
  