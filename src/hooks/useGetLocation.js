import { useQuery } from "@tanstack/react-query";
import { getLocations } from "../services/getLocation";

export const useGetLocation = (filters = {},page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['delivery-locations',filters],
    queryFn: () => getLocations(filters,page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};