import { useQuery } from "@tanstack/react-query";
import { notifyAdmin } from "../services/notification";

export const useNotifyAdmin = (active_outlet) => {
  return useQuery({
    queryKey: ['notify-admin', active_outlet],
    queryFn: () => notifyAdmin(active_outlet),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};