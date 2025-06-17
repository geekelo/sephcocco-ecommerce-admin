import { useQuery } from '@tanstack/react-query';
import { getAllProduct } from '../services/getAllProduct';

export const useViewAllProduct = (activeOutlet, page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['products', activeOutlet, page, perPage], 
    queryFn: () => getAllProduct(activeOutlet, page, perPage),
    enabled: !!activeOutlet, 
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false, 
  });
};