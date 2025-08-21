import { useQuery } from "@tanstack/react-query";

import { getRiders } from "../services/getRiders";

export const useRiders = () => {
  return useQuery({
    queryKey: ['riders'],
    queryFn: () => getRiders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};