import { useQuery } from "@tanstack/react-query";

import { getAllProduct } from "../services/getAllProduct";

export const useViewAllProduct = (active_outlet) => {
  return useQuery({
    queryKey: ['view-products', active_outlet],
    queryFn: () => getAllProduct(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};