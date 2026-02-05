import { useMutation } from "@tanstack/react-query";
import { updateBulkStock } from "../services/updateStock";

export const useUpdateBulkStock = () => {
    return useMutation({
        mutationFn: async ({ active_outlet, payload }) => {
            const response = await updateBulkStock(active_outlet, payload);
            return response;
        },
    });
};
