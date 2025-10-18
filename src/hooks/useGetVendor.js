import { useQuery } from "@tanstack/react-query";
import { getVendor } from "../services/getVendor";

export const useGetVendor = (active_outlet, filters = {}, page, per_page) => {
  return useQuery({
    queryKey: ['vendor', active_outlet, filters, page, per_page],
    queryFn: () => getVendor(active_outlet, filters, page, per_page),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};