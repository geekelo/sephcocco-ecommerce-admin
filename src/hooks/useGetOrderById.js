import { useQuery } from "@tanstack/react-query";
import {  getOrder } from "../services/getOrders";

export const useGetOrderById = (active_outlet,orderId) => {
  return useQuery({
    queryKey: ['view-order', active_outlet,orderId],
    queryFn: () => getOrder(active_outlet,orderId),
    enabled: !!active_outlet || orderId, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (updated from cacheTime)
    keepPreviousData: true, // Keep previous data while loading new page
  });
};