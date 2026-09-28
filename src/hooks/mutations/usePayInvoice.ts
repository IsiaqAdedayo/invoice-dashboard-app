import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payInvoice } from "@/services/invoice.service";

export const usePayInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => payInvoice(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
  });
};
