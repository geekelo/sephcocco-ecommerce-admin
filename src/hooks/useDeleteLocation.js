
import { useMutation } from "@tanstack/react-query";

import { deleteLocations } from "../services/deleteLocations";

export const useDeleteLocation = () => {
  return useMutation({
    mutationFn: async ({ locationId }) => {
    
      
      const response = await deleteLocations(locationId);
      return response;
    }
  });
};
