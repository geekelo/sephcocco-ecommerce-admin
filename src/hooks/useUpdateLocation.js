
import { useMutation } from "@tanstack/react-query";
import { updateLocations } from "../services/updateLocations";

export const useUpdateLocation = () => {
  return useMutation({
    mutationFn: async ({locationId, payload }) => {
    
      
      const response = await updateLocations(locationId, payload);
      return response;
    }
  });
};
