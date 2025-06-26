import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../services/getOrders";

export const useGetOrder = (active_outlet, filters = {}, page,per_page) => {
  return useQuery({
    queryKey: ['orders', active_outlet, filters, page, per_page],
    queryFn: () => getOrder(active_outlet, filters, page,per_page),
    enabled: !!active_outlet,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    keepPreviousData: true,
  });
};
