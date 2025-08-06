import { useQuery } from "@tanstack/react-query";

import { getAllUsers } from "../services/getAllusers";

export const useGetAllUsers = ( filters = {}, page,per_page) => {
  return useQuery({
    queryKey: ['users',filters, page, per_page],
    queryFn: () => getAllUsers( filters, page,per_page),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,   
    keepPreviousData: true,
  });
};
