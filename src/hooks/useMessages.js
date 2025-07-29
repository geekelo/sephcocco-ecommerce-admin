import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../services/getMessages";

export const useViewMessages = (active_outlet) => {
  return useQuery({
    queryKey: ['messages', active_outlet],
    queryFn: () => getMessages(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};