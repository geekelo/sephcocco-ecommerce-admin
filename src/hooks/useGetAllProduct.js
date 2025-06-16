import { useQuery } from "@tanstack/react-query";

import { getAllProduct } from "../services/getAllProduct";

export const useViewAllProduct = (active_outlet) => {
  return useQuery({
    queryKey: ['view-products', active_outlet],
    queryFn: () => getAllProduct(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2, // Only retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onError: (error) => {
      console.error('Error fetching products:', error);
    }
  });
};