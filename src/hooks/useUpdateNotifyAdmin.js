
import { useMutation } from "@tanstack/react-query";

import { updateNotifyAdmin } from "../services/updateNotification";

export const useUpdateNotifyAdmin = () => {
 
    return useMutation({
      mutationFn: async ({active_outlet,notifyId,payload}) => {
        const response = await updateNotifyAdmin(active_outlet,notifyId,payload); 
        return response
      }
    });
  };
  