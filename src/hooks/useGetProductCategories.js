import { useQuery } from "@tanstack/react-query";
import { getProductCategories } from "../services/getProductCategories";

export const useViewProductCategories = (active_outlet,filters = {},page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['productCategories', active_outlet,filters],
    queryFn: () => getProductCategories(active_outlet,filters,page, perPage),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};