import { useQuery } from '@tanstack/react-query';
import { getAllProduct } from '../services/getAllProduct';

export const useViewAllProduct = (activeOutlet, user_id,filters = {}, page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['products', activeOutlet, user_id,filters, page, perPage], 
    queryFn: () => getAllProduct(activeOutlet, user_id,  filters, page, perPage),
    enabled: !!activeOutlet, 
       staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    keepPreviousData: true,
  });
};