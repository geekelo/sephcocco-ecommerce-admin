import { useQuery } from '@tanstack/react-query';
import { getConfirmedWaiterOrders } from '../services/getConfirmedWaiterOrders';

export const useGetConfirmedWaiterOrders = (active_outlet, page, per_page, filters = {}) => {
  return useQuery({
    queryKey: ['waiter-confirmed-orders', active_outlet, page, per_page, filters],
    queryFn: () => getConfirmedWaiterOrders(active_outlet, page, per_page, filters),
    enabled: !!active_outlet,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

