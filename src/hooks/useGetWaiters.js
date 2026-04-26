import { useQuery } from "@tanstack/react-query";
import { getWaiters } from "../services/getWaiters";

export const useGetWaiters = () => {
  return useQuery({
    queryKey: ["waiters"],
    queryFn: getWaiters,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
