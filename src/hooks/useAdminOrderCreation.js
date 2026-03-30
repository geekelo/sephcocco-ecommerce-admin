import { useMutation } from '@tanstack/react-query';
import { adminOrderCreation } from '../services/adminOrderCreation';

export const useAdminOrderCreation = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
      return await adminOrderCreation(active_outlet, payload);
    },
  });
};
