import { useQuery } from "@tanstack/react-query";
import { getActiveDepartment } from "../services/getActiveDepartment";

export const useActiveDepartment = (active_outlet) => {
  return useQuery({
    queryKey: ['active-departments', active_outlet],
    queryFn: () => getActiveDepartment(active_outlet),
    enabled: !!active_outlet, 
    staleTime: 5 * 60 * 1000, 
    cacheTime: 10 * 60 * 1000,
  });
};