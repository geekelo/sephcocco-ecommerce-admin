import { useMutation } from '@tanstack/react-query';
import { createWaiterPayment } from '../services/createWaiterPayment';

export const useCreateWaiterPayment = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, payload }) => {
      return await createWaiterPayment(active_outlet, payload);
    },
  });
};
