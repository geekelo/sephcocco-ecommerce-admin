import { useQuery } from "@tanstack/react-query";
import { getProductCategories } from "../services/getProductCategories";

export const useViewProductCategories = (active_outlet, payload = {}) => {
  return useQuery({
    queryKey: ['productCategories', active_outlet],
    queryFn: () => getProductCategories(active_outlet, payload),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};