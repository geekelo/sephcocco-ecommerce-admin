
import { useMutation } from "@tanstack/react-query";
import { addLocations } from "../services/addLocations";

export const useAddLocation = () => {
  return useMutation({
    mutationFn: async ({  payload }) => {
    
      
      const response = await addLocations(payload);
      return response;
    }
  });
};
