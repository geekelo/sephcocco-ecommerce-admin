import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../services/getRoles";

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};