
import { useMutation } from "@tanstack/react-query";
import { updatePaymentStatus } from "../services/updatePaymentStatus";

export const useUpdatePaymentStatus = () => {
  return useMutation({
    mutationFn: async ({ active_outlet, paymentId, payload }) => {
      const response = await updatePaymentStatus(active_outlet, paymentId, payload);
      return response;
    }
  });
};
  