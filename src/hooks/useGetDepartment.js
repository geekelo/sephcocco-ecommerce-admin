import { useQuery } from "@tanstack/react-query";

import { getDepartment } from "../services/getDepartment";

export const useViewDepartment = (active_outlet,filters = {},page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['departments', active_outlet,filters],
    queryFn: () => getDepartment(active_outlet,filters,page, perPage),
    enabled: !!active_outlet, // Only run query if active_outlet is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};