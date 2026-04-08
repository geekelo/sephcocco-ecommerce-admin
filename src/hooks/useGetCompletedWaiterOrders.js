import { useQuery } from '@tanstack/react-query';
import { getCompletedWaiterOrders } from '../services/getCompletedWaiterOrders';

export const useGetCompletedWaiterOrders = (active_outlet, page, per_page, filters = {}) => {
  return useQuery({
    queryKey: ['waiter-completed-orders', active_outlet, page, per_page, filters],
    queryFn: () => getCompletedWaiterOrders(active_outlet, page, per_page, filters),
    enabled: !!active_outlet,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
