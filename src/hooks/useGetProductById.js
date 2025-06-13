import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../services/getProductById";

export const useViewProductId = (active_outlet, productId) => {
  return useQuery({
    queryKey: ['view-product-id', active_outlet],
    queryFn: () => getProductById(active_outlet,productId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};