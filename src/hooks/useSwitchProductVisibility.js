
import { useMutation } from "@tanstack/react-query";
import { switchProductVisibility } from "../services/switchProductVisibility";


export const useSwitchProductVisibility = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet, productId}) => {
        const response = await switchProductVisibility(active_outlet,productId); 
        return response
      }
    });
  };
  