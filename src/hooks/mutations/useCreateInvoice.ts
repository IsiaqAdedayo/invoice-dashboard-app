import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInvoice } from "@/services/invoice.service";

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
  });
};
