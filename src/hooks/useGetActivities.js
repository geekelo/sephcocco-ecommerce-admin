import { useQuery } from '@tanstack/react-query';
import { getActivities } from '../services/getActivities';

export const useViewActivities = (active_outlet, filters = {}, page = 1, per_page = 10) => {
  return useQuery({
    queryKey: ['view-activities', active_outlet, filters, page, per_page],
   queryFn: () => getActivities(active_outlet,filters, page, per_page),
    enabled: !!active_outlet,
  });
};