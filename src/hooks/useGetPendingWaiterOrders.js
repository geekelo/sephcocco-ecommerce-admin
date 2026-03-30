import { useQuery } from '@tanstack/react-query';
import { getPendingWaiterOrders } from '../services/getPendingWaiterOrders';

export const useGetPendingWaiterOrders = (active_outlet, page, per_page) => {
  return useQuery({
    queryKey: ['waiter-pending-orders', active_outlet, page, per_page],
    queryFn: () => getPendingWaiterOrders(active_outlet, page, per_page),
    enabled: !!active_outlet,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
