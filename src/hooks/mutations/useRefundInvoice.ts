import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundInvoice } from "@/services/invoice.service";

export const useRefundInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => refundInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
  });
};
