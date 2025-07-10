import { useQuery } from "@tanstack/react-query";

import { payment } from "../services/payment";

export const useViewPayment = (active_outlet) => {
  return useQuery({
    queryKey: ['payment', active_outlet],
    queryFn: () => payment(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};