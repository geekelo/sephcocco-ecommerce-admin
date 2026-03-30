import { useMutation } from '@tanstack/react-query';
import { createWaiterOrder } from '../services/createWaiterOrder';

export const useCreateWaiterOrder = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
      return await createWaiterOrder(active_outlet, payload);
    },
  });
};
