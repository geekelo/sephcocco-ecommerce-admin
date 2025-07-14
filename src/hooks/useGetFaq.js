import { useQuery } from "@tanstack/react-query";

import { getFaq } from "../services/getFaq";

export const useGetFaq = (active_outlet) => {
  return useQuery({
    queryKey: ['faq', active_outlet],
    queryFn: () => getFaq(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};