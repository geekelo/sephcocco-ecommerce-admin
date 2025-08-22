import { useQuery } from "@tanstack/react-query";

import { trackOrder } from "../services/trackOrder";

export const useTrackOrder = (riderId) => {
  return useQuery({
    queryKey: ['track-orders', riderId],
    queryFn: () => trackOrder(riderId),
    enabled: !!riderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};