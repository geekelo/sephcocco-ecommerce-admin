import { useQuery } from "@tanstack/react-query";
import { getShipping } from "../services/getShipping";

export const useShippings = (active_outlet,page,per_page) => {
  return useQuery({
    queryKey: ['shippings', active_outlet,page,per_page],
    queryFn: () => getShipping(active_outlet,page,per_page),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};