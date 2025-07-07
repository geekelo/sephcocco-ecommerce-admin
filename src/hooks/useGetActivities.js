import { useQuery } from "@tanstack/react-query";

import { getActivities } from "../services/getActivities";

export const useViewActivities = (active_outlet) => {
  return useQuery({
    queryKey: ['activities', active_outlet],
    queryFn: () => getActivities(active_outlet),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};