import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInvoiceStatus } from "@/services/invoice.service";

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
  });
};
