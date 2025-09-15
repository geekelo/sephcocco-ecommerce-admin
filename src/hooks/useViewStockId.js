import { useQuery } from "@tanstack/react-query";
import { getStockById } from "../services/getStockById";

export const useViewStockId = (active_outlet, stockId) => {
  return useQuery({
    queryKey: ['view-stock-id', active_outlet, stockId],
    queryFn: () => getStockById(active_outlet, stockId),
    enabled: !!active_outlet && !!stockId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};